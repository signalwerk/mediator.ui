import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuthContext } from "../context/AuthProvider";
import Button from "./Button";

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
      <Button onClick={handleBackup}>Backup now</Button>
      <p>{status}</p>
    </div>
  );
}

export default Root;
