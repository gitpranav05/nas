const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mime = require("mime-types");

const app = express();
app.use(express.json());
app.use(cors());

// Configure storage to maintain original file name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

// File upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    success: true,
    filename: req.file.filename,
    originalname: req.file.originalname,
    type: req.file.mimetype,
  });
});

// Get list of all files
app.get("/files", (req, res) => {
  fs.readdir("./uploads", (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to scan files" });
    }
    const fileData = files.map((file) => {
      const stats = fs.statSync(path.join("./uploads", file));
      return {
        name: file,
        size: stats.size,
        type: mime.lookup(file) || "application/octet-stream",
        modified: stats.mtime,
      };
    });
    res.json(fileData);
  });
});

// Download file endpoint
app.get("/download/:filename", (req, res) => {
  const filePath = path.join("./uploads", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Delete file endpoint
app.delete("/delete/:filename", (req, res) => {
  const filePath = path.join("./uploads", req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete file" });
    }
    res.json({ success: true });
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
