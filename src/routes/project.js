import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import DeleteButton from "../components/DeleteButton"; // Adjust the path accordingly

import { createHashRouter, RouterProvider } from "react-router-dom";

import axios from "axios";
import { API_BASE_URL } from "../config";

function ProjectDetail() {
  let { projectId } = useParams();
  const { authToken } = useAuthContext();

  const refFile = useRef();

  const [files, setFiles] = useState([]);
  const [project, setProject] = useState({});
  const [newFileName, setNewFileName] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [selectedFile, onFileSelection] = useState(null);

  const fetchProject = async (projectId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setProject(response.data);
      setNewProjectTitle(response.data.title);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };
  const fetchFiles = async (projectId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/${projectId}/files`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    if (projectId && authToken) {
      fetchFiles(projectId);
      fetchProject(projectId);
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
    // Loop through the files and append them to the FormData
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
        }
      );

      // Fetch the latest files
      fetchFiles(projectId);

      // Empty the selected files
      setUploadFiles([]);
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
      <button onClick={handleProjectTitleUpdate}>Update</button>

      <hr />
      <input
        type="file"
        multiple
        ref={refFile}
        onChange={(e) => setUploadFiles(Array.from(e.target.files))}
      />
      <button onClick={handleFileUpload}>Upload</button>
      <hr />

      {
        <div>
          <h2>{projectId.title}</h2>
          <h3>Files</h3>
          <ul>
            {files.map((file) => (
              <li key={file._id}>
                <img
                  src={`http://localhost:3000/typesetting/${file.hash}/resize@width:130;/slug.jpg`}
                />
                <button onClick={() => handleFileSelection(file)}>edit </button>
                <DeleteButton onDelete={() => handleFileDeletion(file._id)} />
                {file.filename} - {file.title}
              </li>
            ))}
          </ul>

          {selectedFile && (
            <FileDetail
              API_BASE_URL={API_BASE_URL}
              authToken={authToken}
              projectId={projectId}
              selectedFile={selectedFile}
            />
          )}
        </div>
      }
    </div>
  );
}

function FileDetail({ API_BASE_URL, authToken, projectId, selectedFile }) {
  const [file, setFile] = useState({});

  useEffect(() => {
    fetchFileContent(selectedFile);
  }, [selectedFile]);

  const fetchFileContent = async (file) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/${projectId}/files/${file._id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setFile(response.data);
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

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
    <div className="file-detail">
      <h2>Edit File: {file.filename}</h2>
      <h3>Title</h3>
      <textarea
        rows="10"
        value={file.title || ""}
        onChange={handleFileTitleChange}
      />
      <button onClick={handleFileContentUpdate}>Update</button>
      {/* <pre>{JSON.stringify(file, null, 2)}</pre> */}
    </div>
  );
}

export default ProjectDetail;
