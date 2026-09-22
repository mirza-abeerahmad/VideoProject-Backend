import mongoose, {Schema} from "mongoose";

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
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


export const Tweet = mongoose.model("Tweet", tweetSchema)