import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import DeleteButton from "../components/DeleteButton";
import Crop from "../components/Crop/Crop";
import Button from "../components/Button";
import ProgressBar from "./ProgressBar"; // Import the ProgressBar component
import Overlay from "./Overlay";

import axios from "axios";
import { API_BASE_URL } from "../config";

import "./project.css";
import { FileDetail } from "./FileDetail";

const copyToClipboard = (path) => {
  navigator.clipboard.writeText(path).then(
    () => console.log("Path copied to clipboard"),
    (err) => console.error("Error copying text: ", err)
  );
};

export const fetchFileContent = async ({ file, projectId, authToken }, cb) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${projectId}/files/${file._id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    cb(response.data);
  } catch (error) {
    console.error("Error fetching file content:", error);
  }
};

const fetchProject = async ({ projectId, authToken }, cb) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    cb(response.data);
  } catch (error) {
    console.error("Error fetching files:", error);
  }
};

const fetchFiles = async ({ projectId, authToken }, cb) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${projectId}/files`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    cb(response.data);
  } catch (error) {
    console.error("Error fetching files:", error);
  }
};

function ProjectDetail() {
  let { projectId } = useParams();
  const { authToken } = useAuthContext();

  const refFile = useRef();

  const [files, setFiles] = useState([]);
  const [project, setProject] = useState({});
  const [uploadFiles, setUploadFiles] = useState([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [selectedFile, onFileSelection] = useState(null);
  const [totalUploadProgress, setTotalUploadProgress] = useState(0);

  useEffect(() => {
    if (projectId && authToken) {
      fetchFiles({ projectId, authToken }, setFiles);
      fetchProject({ projectId, authToken }, (data) => {
        setProject(data);
        setNewProjectTitle(data.title);
      });
    }
  }, [projectId, authToken]);

  if (!authToken) {
    return (
      <div className="project-detail">
        <h2>Project Detail</h2>
        <p>
          <Link to="/">Log in</Link> to view project details.
        </p>
      </div>
    );
  }

  const handleFileUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) return;

    const formData = new FormData();
    for (const file of uploadFiles) {
      formData.append("files[]", file);
    }

    try {
      await axios.post(
        `${API_BASE_URL}/projects/${projectId}/uploads`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setTotalUploadProgress(progress);
          },
        }
      );

      // Fetch the latest files
      fetchFiles({ projectId, authToken }, setFiles);

      // Reset state
      setUploadFiles([]);
      setTotalUploadProgress(0);
      refFile.current.value = "";
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleFileDeletion = async (fileId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/projects/${projectId}/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      fetchFiles(projectId);
      if (selectedFile && selectedFile._id === fileId) {
        onFileSelection(null);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const closeFileDetail = () => {
    onFileSelection(null);
  };

  const handleFileSelection = (file) => {
    onFileSelection(file);
  };

  const handleProjectTitleChange = (event) => {
    setNewProjectTitle(event.target.value);
  };

  const handleProjectTitleUpdate = async () => {
    if (!newProjectTitle.trim()) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/projects/${projectId}`,
        { newTitle: newProjectTitle },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setProject(response.data);

      // fetchProjects(authToken);
      // setNewProjectTitle("");
    } catch (error) {
      console.error("Error updating project title:", error);
    }
  };

  return (
    <div className="project-detail">
      <p>
        <Link to="/">← back</Link>
      </p>

      <h2>{project.title}</h2>
      <input
        type="text"
        placeholder="New Project Title"
        value={newProjectTitle}
        onChange={handleProjectTitleChange}
      />
      <Button onClick={handleProjectTitleUpdate}>Update</Button>

      <hr />
      <input
        type="file"
        multiple
        ref={refFile}
        onChange={(e) => setUploadFiles(Array.from(e.target.files))}
      />
      <Button onClick={handleFileUpload}>Upload</Button>
      {totalUploadProgress && <ProgressBar progress={totalUploadProgress} />}

      <hr />

      {
        <div className="project-detail__files">
          <h2>{projectId.title}</h2>
          <h3>Files</h3>
          <p>Count: {files.length}</p>
          <ul className="project-detail__file-list">
            {files.map((file) => {
              const imagePath = `${API_BASE_URL}/${project.title}/${file.hash}/resize@width:250;/${file.filename}.jpg`;
              const createdAt = new Date(file.createdAt)
                .toISOString()
                .split("T")[0];
              const updatedAt = new Date(file.updatedAt)
                .toISOString()
                .split("T")[0];

              return (
                <li key={file._id} className="project-detail__file-item">
                  <div className="project-detail__image-container">
                    <img
                      src={imagePath}
                      alt="preview"
                      className="project-detail__image"
                    />
                  </div>
                  <div className="project-detail__info">
                    <div className="project-detail__text">
                      Filename: {file.filename}
                      {file.title && (
                        <>
                          <br />
                          Title: {file.title}
                        </>
                      )}
                      <br />
                      Created: {createdAt}
                      <br />
                      Updated: {updatedAt}
                    </div>
                    <div className="project-detail__buttons">
                      <Button
                        className="button"
                        onClick={() => handleFileSelection(file)}
                      >
                        Edit
                      </Button>
                      <DeleteButton
                        onDelete={() => handleFileDeletion(file._id)}
                      />
                      <Button
                        className="button"
                        onClick={() => copyToClipboard(imagePath)}
                      >
                        Copy Path
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {selectedFile && (
            <>
              <Overlay>
                <FileDetail
                  authToken={authToken}
                  projectId={projectId}
                  selectedFile={selectedFile}
                />
                <Crop project={project.title} selectedFile={selectedFile} />
                <br />
                <Button
                  className="file-detail__close-button"
                  onClick={closeFileDetail}
                >
                  Close
                </Button>
              </Overlay>
            </>
          )}
        </div>
      }
    </div>
  );
}

export default ProjectDetail;
