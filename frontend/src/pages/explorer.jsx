import React, { useState, useEffect } from "react";
import axios from "axios";
import { beUrl } from "../constants";

export default function Explorer() {
  const [photos, setPhotos] = useState([]);
  const [err, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  async function getPhotos() {
    try {
      const response = await axios.get(`${beUrl}/getpnames`);
      if (response.data?.data) {
        setPhotos(response.data.data);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      setError(true);
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
       await axios.post(`${beUrl}/uploadphoto`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadStatus("File uploaded successfully!");
      setSelectedFile(null);
      // Refresh the photo list after upload
      await getPhotos();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("File upload failed!");
    }
  };

  const fetchImage = async (filename) => {
    try {
      const response = await fetch(`${beUrl}/getimages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: filename }),
      });

      if (!response.ok) throw new Error("Image not found");
      const blob = await response.blob();
      setImageSrc(URL.createObjectURL(blob));
      setSelectedImage(filename);
    } catch (error) {
      console.error("Error fetching image:", error);
      setError(true);
    }
  };

  useEffect(() => {
    getPhotos();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-8">Image Explorer</h1>

      <div className="mb-8">
        <div className="flex w-fit bg-slate-100 p-2 rounded items-center hover:bg-slate-200   ">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            accept="image/*"
            
          ></input>
          <button
            onClick={handleFileUpload}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
          </button>
        </div>
        {uploadStatus && (
          <p
            className={`mt-2 ${
              uploadStatus.includes("success")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {uploadStatus}
          </p>
        )}
      </div>

      <div>
        {err ? (
          <p className="text-red-500">Error loading photos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => fetchImage(photo)}
                className="w-full p-2 bg-gray-100 hover:bg-gray-200 rounded text-left truncate"
              >
                {photo}
              </button>
            ))}
          </div>
        )}
      </div>

      {imageSrc && selectedImage && (
        <div className="mt-8 text-center">
          <h2 className="text-xl mb-4">Currently Viewing: {selectedImage}</h2>
          <img
            src={imageSrc}
            alt={selectedImage}
            className="max-w-full max-h-[70vh] shadow-lg rounded-lg mx-auto"
          />
        </div>
      )}
    </div>
  );
}