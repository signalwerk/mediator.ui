import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuthContext } from "../context/AuthProvider";

function Root() {
  const { authToken } = useAuthContext();

  const [status, setStatus] = useState("");

  const handleBackup = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/backup`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setStatus(response.data);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="App">
      <button onClick={handleBackup}>Backup now</button>
      <p>{status}</p>
    </div>
  );
}

export default Root;
