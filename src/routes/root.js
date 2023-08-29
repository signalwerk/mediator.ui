import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuthContext } from "../context/AuthProvider";
import DeleteButton from '../components/DeleteButton'; // Adjust the path accordingly




function Root() {
  const [inputAuthToken, setInputAuthToken] = useState("");
  const { authToken, updateAuthToken } = useAuthContext();
  const [projects, setProjects] = useState([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");

  useEffect(() => {
    if (authToken) {
      fetchProjects(authToken);
    } else {
      setProjects([]);
    }
  }, [authToken]);

  const fetchProjects = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleAuthTokenChange = (event) => {
    setInputAuthToken(event.target.value);
  };

  const handleAuthSubmit = () => {
    localStorage.setItem("authToken", inputAuthToken);
    updateAuthToken(inputAuthToken);
    // fetchProjects(authToken);
  };

  const handleLogOut = () => {
    updateAuthToken("");
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`${API_BASE_URL}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      fetchProjects(authToken);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleCreateProject = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/projects`,
        { title: newProjectTitle },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      fetchProjects(authToken);
      setNewProjectTitle("");
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <Outlet />
        <h1>Project Manager</h1>
        {authToken ? (
          <div>
            <button onClick={handleLogOut}>Log out</button>
            <h2>Projects</h2>
            <ul>
              {projects.map((project) => (
                <li key={project._id}>
                  <Link to={`/projects/${project._id}`}>{project.title}</Link>

                  <DeleteButton
                    onDelete={() => handleDeleteProject(project._id)}
                  />
                </li>
              ))}
            </ul>

            <h2>Create New Project</h2>
            <input
              type="text"
              placeholder="Project Title"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
            />
            <button onClick={handleCreateProject}>Create</button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Enter Auth Token"
              value={inputAuthToken}
              onChange={handleAuthTokenChange}
            />
            <button onClick={handleAuthSubmit}>Log in</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default Root;
