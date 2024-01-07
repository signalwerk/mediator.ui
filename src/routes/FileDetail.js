import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { fetchFileContent } from "./project";

import "./FildeDetail.css";

export function FileDetail({ authToken, projectId, selectedFile, onClose }) {
  const [file, setFile] = useState({});

  useEffect(() => {
    fetchFileContent({ file: selectedFile, projectId, authToken }, setFile);
  }, [selectedFile, projectId, authToken]);

  const handleFileTitleChange = (event) => {
    setFile((item) => ({ ...item, title: event.target.value }));
  };

  const handleFileContentUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/projects/${projectId}/files/${selectedFile._id}`,
        { newTitle: file.title },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating file content:", error);
    }
  };

  return (
    <div className="file-detail__overlay">
      <div className="file-detail__content">
        <h2>Edit File: {file.filename}</h2>
        <h3>Title</h3>
        <textarea
          rows="10"
          value={file.title || ""}
          onChange={handleFileTitleChange}
        />
        <br />
        <Button className="file-detail__close-button" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleFileContentUpdate}>Update</Button>
        {/* <pre>{JSON.stringify(file, null, 2)}</pre> */}
      </div>
    </div>
  );
}
