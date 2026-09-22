import mongoose, { Schema } from "mongoose";

const watchHistorySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true
        },

        progress: {
            type: Number,
            default: 0,
            min: 0
        },

        isCompleted: {
            type: Boolean,
            default: false
        },

        watchedAt: {
            type: Date,
            default: Date.now,
            index: true
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },

        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// One user can have only one watch-history record per video
watchHistorySchema.index(
    { user: 1, video: 1 },
    { unique: true }
);

export const WatchHistory = mongoose.model(
    "WatchHistory",
    watchHistorySchema
);