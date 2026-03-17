// src/pages/Dashboard.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosClient";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [accessType, setAccessType] = useState("private");
  const fileInputRef = useRef();

  // Fetch user's files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/files");
      setFiles(res.data.files);
    } catch (err) {
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return setError("Please select a file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accessType", accessType);

    setUploading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("File uploaded successfully!");
      fileInputRef.current.value = "";
      fetchFiles();
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const res = await api.get(`/download/${fileId}`);
      // Open the pre-signed URL in a new tab for download
      window.open(res.data.downloadUrl, "_blank");
    } catch (err) {
      setError("Failed to generate download link");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    setError("");
    try {
      await api.delete(`/delete/${fileId}`);
      setSuccess("File deleted successfully");
      setFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    } catch (err) {
      setError(err.response?.data?.error || "Delete failed");
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>🔐 Secure File Sharing</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Alerts */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Upload Section */}
        <section className="upload-section">
          <h2>Upload File</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <input type="file" ref={fileInputRef} className="file-input" />
            <select value={accessType} onChange={(e) => setAccessType(e.target.value)} className="select-input">
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </section>

        {/* Files Table */}
        <section className="files-section">
          <div className="files-header">
            <h2>My Files</h2>
            <button className="btn btn-outline btn-sm" onClick={fetchFiles}>↻ Refresh</button>
          </div>

          {loading ? (
            <div className="loading">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="empty-state">No files uploaded yet. Upload your first file above!</div>
          ) : (
            <div className="table-wrapper">
              <table className="files-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Access Type</th>
                    <th>Uploaded On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.fileId}>
                      <td className="file-name">{file.fileName}</td>
                      <td>
                        <span className={`badge badge-${file.accessType}`}>{file.accessType}</span>
                      </td>
                      <td>{formatDate(file.createdAt)}</td>
                      <td className="actions">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleDownload(file.fileId, file.fileName)}
                        >
                          ⬇ Download
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(file.fileId)}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
