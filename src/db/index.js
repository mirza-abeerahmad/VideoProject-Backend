import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const cleanupLegacyLikeIndexes = async () => {
    try {
        const db = mongoose.connection.db;
        if (!db) return;

        const legacyIndexes = ["user_1_video_1", "user_1_comment_1", "user_1_tweet_1"];
        for (const indexName of legacyIndexes) {
            try {
                await db.collection("likes").dropIndex(indexName);
                console.log(`Dropped legacy like index: ${indexName}`);
            } catch (error) {
                // Ignore missing index errors.
            }
        }
            
        await db.collection("likes").deleteMany({
            $or: [
                { video: null },
                { comment: null },
                { tweet: null },
                { likedBy: null },
            ],
        });
        console.log("Removed stale null-valued like records.");
    } catch (error) {
        console.warn("Legacy like cleanup skipped:", error.message || error);
    }
};

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        await cleanupLegacyLikeIndexes();
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

export default connectDB