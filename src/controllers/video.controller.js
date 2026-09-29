import { v2 as cloudinary } from "cloudinary"
import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, q, search, sortBy = "createdAt", sortType = "desc", duration, userId } = req.query
    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50)
    const searchText = (query ?? q ?? search ?? "").toString().trim()
    const filter = { isPublished: true, isDeleted: { $ne: true } }





    
    if (searchText) {
        const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        filter.$or = [
            { title: { $regex: escapedSearch, $options: "i" } },
            { description: { $regex: escapedSearch, $options: "i" } },
        ]
    }

    if (userId) {
        if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user id")
        filter.owner = userId
    }

    if (duration && duration !== "all") {
        const durationRanges = {
            short: { $lt: 300 },
            medium: { $gte: 300, $lt: 1200 },
            long: { $gte: 1200 },
        }

        if (!durationRanges[duration]) throw new ApiError(400, "Invalid duration filter")
        filter.duration = durationRanges[duration]
    }

    const sortFields = {
        createdAt: "createdAt",
        views: "views",
        title: "title",
    }
    if (!sortFields[sortBy] || !["asc", "desc"].includes(sortType)) {
        throw new ApiError(400, "Invalid video sorting options")
    }

    const sort = { [sortFields[sortBy]]: sortType === "asc" ? 1 : -1, _id: -1 }
    const [videos, total] = await Promise.all([
        Video.find(filter).populate("owner", "fullName username avatar").sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
        Video.countDocuments(filter),
    ])

    return res.status(200).json(new ApiResponse(200, { videos, page: pageNumber, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) }, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, videoUrl, thumbnailUrl, duration } = req.body
    if (!title?.trim() || !description?.trim()) throw new ApiError(400, "Title and description are required")
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const isCloudinaryAsset = (assetUrl, resourceType) => {
        try {
            const parsedUrl = new URL(assetUrl)
            return parsedUrl.protocol === "https:" && parsedUrl.hostname === "res.cloudinary.com" && parsedUrl.pathname.startsWith(`/${cloudName}/${resourceType}/upload/`)
        } catch {
            return false
        }
    }
    if (!isCloudinaryAsset(videoUrl, "video") || !isCloudinaryAsset(thumbnailUrl, "image")) {
        throw new ApiError(400, "Valid uploaded video and thumbnail URLs are required")
    }
    const video = await Video.create({ title: title.trim(), description: description.trim(), videoFile: videoUrl, thumbnail: thumbnailUrl, duration: Math.max(Number(duration) || 0, 0), owner: req.user._id })
    return res.status(201).json(new ApiResponse(201, await video.populate("owner", "fullName username avatar"), "Video published successfully"))
})

const createVideoUploadSignature = asyncHandler(async (req, res) => {
    const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env
    if (!cloudName || !apiKey || !apiSecret) throw new ApiError(503, "Media uploads are not configured")

    const timestamp = Math.floor(Date.now() / 1000)
    const createSignature = (folder) => {
        const params = { timestamp, folder }
        return { ...params, signature: cloudinary.utils.api_sign_request(params, apiSecret) }
    }

    return res.status(200).json(new ApiResponse(200, {
        cloudName,
        apiKey,
        video: createSignature(`streamly/${req.user._id}/videos`),
        thumbnail: createSignature(`streamly/${req.user._id}/thumbnails`),
    }, "Upload authorization created"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const visibility = req.user ? { $or: [{ isPublished: true }, { owner: req.user._id }] } : { isPublished: true }
    const video = await Video.findOne({ _id: videoId, ...visibility }).populate("owner", "fullName username avatar")
    if (!video) throw new ApiError(404, "Video not found")

    if (req.user) {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $addToSet: { watchHistory: video._id }
            },
            { new: true }
        )
    }

    await Video.updateOne({ _id: videoId }, { $inc: { views: 1 } })
    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const video = await Video.findOne({ _id: videoId, owner: req.user._id })
    if (!video) throw new ApiError(404, "Video not found or unauthorized")
    const { title, description } = req.body
    if (title !== undefined) video.title = title.trim()
    if (description !== undefined) video.description = description.trim()
    if (req.file?.path) {
        const thumbnail = await uploadOnCloudinary(req.file.path)
        if (!thumbnail) throw new ApiError(500, "Unable to upload thumbnail")
        video.thumbnail = thumbnail.url
    }
    await video.save()
    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const video = await Video.findOneAndDelete({ _id: videoId, owner: req.user._id })
    if (!video) throw new ApiError(404, "Video not found or unauthorized")
    return res.status(200).json(new ApiResponse(200, video, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id")
    const video = await Video.findOne({ _id: videoId, owner: req.user._id })
    if (!video) throw new ApiError(404, "Video not found or unauthorized")
    video.isPublished = !video.isPublished
    await video.save()
    return res.status(200).json(new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`))
})

export {
    getAllVideos,
    publishAVideo,
    createVideoUploadSignature,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
