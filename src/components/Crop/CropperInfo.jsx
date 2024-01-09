import React, { useContext } from "react";

import { CropContext } from "./CropContext";

const CropperInfo = ({
  respectsBounds = true,
  aspectRatio = 1.666,
  width,
  height,
  id,
}) => {
  const {
    cropDimensions,
    // setCropDimensions,
    // isShiftPressed,
    // setIsShiftPressed,
    // lockedRatio,
    // setLockedRatio,
  } = useContext(CropContext);

  const crop = `crop@left:${cropDimensions.x * width},top:${
    cropDimensions.y * height
  },width:${cropDimensions.width * width},height:${
    cropDimensions.height * height
  };`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(crop);
    // alert("Crop information copied to clipboard!");
  };

  return (
    <div className="cropper-info">
      <ul>
        <li>x: {cropDimensions.x}</li>
        <li>y: {cropDimensions.y}</li>
        <li>width: {cropDimensions.width}</li>
        <li>height: {cropDimensions.height}</li>
        {/* <li>
          preview:{" "}
          <a
            href={`http://localhost:3006/seraina-gilly/${id}/${crop};resize@width:600/img.jpg`}
            target="_blank"
          >
            img
          </a>
        </li> */}
        <li>
          <button onClick={copyToClipboard}>Copy Crop</button>
        </li>
      </ul>
    </div>
  );
};

export default CropperInfo;
