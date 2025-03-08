const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors")

//ye makes sure ki file is stored as png or tune jo bhi bheja hai
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./files");
  },
  filename: function(req, file, cb) {
    console.log(file.mimetype);
    const type = 'png'
    const uniqueSuffix = Date.now() + "-" + "." + type;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

//middlewares


const upload = multer({ storage: storage });
const app = express();
app.use(express.json())
app.use(cors())





//routes
app.post("/uploadphoto", upload.single("photo"), function(req, res, next) {
  console.log(req.file);
  res.send("File uploaded successfully.");
});

app.get("/getpnames", (req, res) => {
  const root = __dirname
  fs.readdir(`${root}/files`, (err, data) => {
    if (err) {
      res.send("error")
      return
    }
    else {
      res.json({ data })
      return
    }
  })
})

app.post("/getimages", (req, res) => {
  const root = __dirname;

  const { name } = req.body
  console.log(name);
  res.type("png");
  const stream = fs.createReadStream(`${root}/files/${name}`);
  stream.on("data", (chunk) => res.write(chunk));
  stream.on("end", () => res.end());
  console.log(name);
});





const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
