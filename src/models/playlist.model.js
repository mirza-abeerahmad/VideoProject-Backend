import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
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
}, {timestamps: true})



export const Playlist = mongoose.model("Playlist", playlistSchema)