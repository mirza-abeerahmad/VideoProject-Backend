import fs from "fs";
import os from "os";
import path from "path";
import multer from "multer";

const tempDir = path.join(os.tmpdir(), "streamly-uploads");
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const originalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeName = `${Date.now()}-${originalName}`;
    cb(null, safeName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 200,
  },
});
