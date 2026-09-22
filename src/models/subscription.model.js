import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
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



export const Subscription = mongoose.model("Subscription", subscriptionSchema)