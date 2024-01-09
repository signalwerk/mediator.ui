import React from "react";
import ResizableDiv from "./ResizableDiv";
import { CropProvider } from "./CropContext";
import CropperInfo from "./CropperInfo";

const Cropper = ({ ratio, children, width, height, id }) => {
  const [widthRatio, heightRatio] = ratio.split(":").map(Number);

  const isLandscape = widthRatio > heightRatio;

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    width: "100%",
    height: "100%",
    minHeight: "600px",
    backgroundColor: "green",
    position: "relative",
  };

  const ratioStyle = {
    width: "90%",
    height: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",

    position: "absolute",
    overflow: "hidden",
  };

  const ratioStyleInner = {
    aspectRatio: `${widthRatio}/${heightRatio}`,
    position: "relative",

    width: isLandscape ? "100%" : `auto`,
    height: isLandscape ? "auto" : `100%`,
  };

  return (
    <div className="cropper" style={containerStyle}>
      <div className="cropper__max-dimension" style={ratioStyle}>
        <div className="cropper__ratio" style={ratioStyleInner}>
          <CropProvider>
            {children}
            <ResizableDiv />
            <CropperInfo width={width} height={height} id={id} />
          </CropProvider>
        </div>
      </div>
    </div>
  );
};

export default Cropper;
