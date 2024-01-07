import React from "react";

import "./Overlay.css";

const Overlay = ({ children }) => {
  return (
    <div className="overlay">
      <div className="overlay__content">{children}</div>
    </div>
  );
};

export default Overlay;
