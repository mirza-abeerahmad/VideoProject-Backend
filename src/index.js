// require('dotenv').config({path: './env'})
import dns from "dns"
dns.setServers(['8.8.8.8', '8.8.4.4'])
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from "./app.js"

dotenv.config({
  path: './.env'
})

connectDB()
.then(() => {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`[SERVER] Streamly API running on port ${port}`);
    console.log(`[SERVER] Healthcheck: /api/v1/healthcheck`);
    })
    app.on("error", (error) => {
    console.error("[SERVER] Application error:", error);
        throw error
      })
})
.catch((err) => {
  console.error("[SERVER] Startup failed:", err);
    
})
















/*
import express from "express"
const app = express()


// iffi
;( async () => {
    try {
      await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
      app.on("error", (error) => {
        console.log("Error not data base connected", error);
        throw error
      })

      app.listen(process.env.PORT, () => {
        console.log(`App is running on port ${process.env.PORT}`);
        
      })
    } catch (error) {
        console.error("Error: ", error);
        throw err
    }
})()

*/