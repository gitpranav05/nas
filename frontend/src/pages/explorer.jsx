import React, { useState, useEffect } from "react";
import axios from "axios";
import { beUrl } from "../constants";

const FileIcon = ({ type }) => {
  const iconClass = "w-8 h-8 text-gray-400";
  
  if (type.startsWith('image/')) {
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type.startsWith('video/')) {
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type.startsWith('audio/')) {
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    );
  }
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i]);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export default function CloudStorage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ message: '', isError: false });
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${beUrl}/files`);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setUploadStatus({ message: 'Failed to load files', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus({ message: 'Uploading...', isError: false });
      await axios.post(`${beUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadStatus({ message: 'File uploaded successfully!', isError: false });
      await fetchFiles();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({ 
        message: error.response?.data?.error || 'Upload failed!', 
        isError: true 
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleDownload = (file) => {
    let filename = file.name;
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (file.type.startsWith('video/') && ext !== 'mp4') {
      filename = file.name.replace(/\.[^/.]+$/, '') + '.mp4';
    } else if (file.type.startsWith('audio/') && ext !== 'mp3') {
      filename = file.name.replace(/\.[^/.]+$/, '') + '.mp3';
    }
    
    const link = document.createElement('a');
    link.href = `${beUrl}/download/${file.name}`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;
    
    try {
      await axios.delete(`${beUrl}/delete/${filename}`);
      if (selectedFile?.name === filename) {
        setSelectedFile(null);
        setPreviewUrl('');
      }
      await fetchFiles();
    } catch (error) {
      console.error("Delete error:", error);
      setUploadStatus({ 
        message: error.response?.data?.error || 'Delete failed!', 
        isError: true 
      });
    }
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      setPreviewUrl(`${beUrl}/download/${file.name}`);
    } else {
      setPreviewUrl('');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Cloud Storage</h1>
          <p className="mt-2 opacity-90">Store and manage all your files in one place</p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Upload Files</h2>
                <p className="text-sm text-gray-600">Supports all file types (100MB max)</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md cursor-pointer transition-colors">
                  <input 
                    type="file" 
                    onChange={handleUpload} 
                    className="hidden" 
                    accept="*"
                  />
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Select File
                </label>
              </div>
            </div>
            {uploadStatus.message && (
              <div className={`mt-3 px-3 py-2 rounded text-sm ${uploadStatus.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {uploadStatus.message}
              </div>
            )}
          </div>

          {/* File Browser */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* File List */}
            <div className="lg:w-1/3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-100">
                <h2 className="font-semibold text-gray-800">Your Files ({files.length})</h2>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-2">No files uploaded yet</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {files.map((file) => (
                      <li 
                        key={file.name}
                        className="p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center min-w-0 flex-1 cursor-pointer"
                            onClick={() => handlePreview(file)}
                          >
                            <div className="flex-shrink-0 mr-3">
                              <FileIcon type={file.type} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(file);
                              }}
                              className="text-white bg-blue-500 hover:bg-blue-600 p-2 rounded-md transition-colors"
                              title="Download"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(file.name);
                              }}
                              className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-md transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:w-2/3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-100">
                <h2 className="font-semibold text-gray-800">
                  {selectedFile ? selectedFile.name : 'File Preview'}
                </h2>
              </div>
              <div className="p-4 h-full">
                {selectedFile ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-grow flex items-center justify-center bg-white rounded-lg p-4 mb-4">
                      {previewUrl ? (
                        selectedFile.type.startsWith('image/') ? (
                          <img 
                            src={previewUrl} 
                            alt={selectedFile.name} 
                            className="max-w-full max-h-96 object-contain rounded-lg shadow-sm" 
                          />
                        ) : selectedFile.type.startsWith('video/') ? (
                          <video 
                            controls 
                            className="max-w-full max-h-96 rounded-lg shadow-sm"
                          >
                            <source src={previewUrl} type={selectedFile.type} />
                            Your browser does not support the video tag.
                          </video>
                        ) : selectedFile.type.startsWith('audio/') ? (
                          <div className="w-full p-4">
                            <audio controls className="w-full">
                              <source src={previewUrl} type={selectedFile.type} />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : null
                      ) : (
                        <div className="text-center p-6">
                          <FileIcon type={selectedFile.type} className="mx-auto w-16 h-16 mb-4" />
                          <p className="text-gray-700 font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {formatBytes(selectedFile.size)} • {selectedFile.type}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-3">File Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex">
                          <span className="text-gray-500 w-24">Name:</span>
                          <span className="truncate">{selectedFile.name}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-24">Type:</span>
                          <span>{selectedFile.type}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-24">Size:</span>
                          <span>{formatBytes(selectedFile.size)}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-500 w-24">Modified:</span>
                          <span>{formatDate(selectedFile.modified)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <p>Select a file to preview details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}