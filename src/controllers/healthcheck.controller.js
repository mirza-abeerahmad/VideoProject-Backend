import mongoose from "mongoose"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    const database = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    const health = {
        status: "ok",
        api: "running",
        database,
        endpoints: {
            healthcheck: "/api/v1/healthcheck",
            users: "/api/v1/users",
            videos: "/api/v1/videos",
            comments: "/api/v1/comments",
        },
    }

    console.log(`[HEALTH] API running | database: ${database}`)
    return res.status(200).json(new ApiResponse(200, health, "API is healthy"))
})

export {
    healthcheck
    }
    