import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();
router
    .route("/")
    .get(getAllVideos)
    .post(
        verifyJWT,
        authorizeRoles("creator", "admin"),
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(verifyJWT, authorizeRoles("creator", "admin"), deleteVideo)
    .patch(verifyJWT, authorizeRoles("creator", "admin"), upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, authorizeRoles("creator", "admin"), togglePublishStatus);

export default router