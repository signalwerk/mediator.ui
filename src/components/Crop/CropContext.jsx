import React, { useState, createContext } from "react";

export const CropContext = createContext();

export const CropProvider = ({ children }) => {
  const [cropDimensions, setCropDimensions] = useState({
    x: 0.25,
    y: 0.25,
    width: 0.5,
    height: 0.25,
  });

  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [lockedRatio, setLockedRatio] = useState(1);

  const value = {
    cropDimensions,
    setCropDimensions,
    isShiftPressed,
    setIsShiftPressed,
    lockedRatio,
    setLockedRatio,
  };

  return <CropContext.Provider value={value}>{children}</CropContext.Provider>;
};
