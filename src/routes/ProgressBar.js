import React from "react";
import "./ProgressBar.css"; // Make sure to create this CSS file

const ProgressBar = ({ progress }) => {
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
