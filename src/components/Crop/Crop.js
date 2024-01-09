import React, { useState, useEffect } from "react";
import "./Crop.css";
import Cropper from "./Cropper";
import { API_BASE_URL } from "../../config";

function Crop({ project, selectedFile, onClose }) {
  console.log("selectedFile", selectedFile);
  //   const [imageSource, setImageSource] = useState("IMG_1769.jpg");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  //   const handleImageChange = (event) => {
  //     setImageSource(event.target.value);
  //   };

  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        const response = await fetch(
          //   `http://localhost:3006/seraina-gilly/${imageSource}/resize@width:600/img.json`

          `${API_BASE_URL}/${project}/${selectedFile.hash}/resize@width:130;/img.json`
        );
        const data = await response.json();
        setImageSize({
          width: data.meta.normalizedWidth,
          height: data.meta.normalizedHeight,
        });
      } catch (error) {
        console.error("Error fetching image size:", error);
      }
    };

    fetchImageSize();
  }, [selectedFile.hash, project]);

  return (
    <div className="App">
      {/* <div>
        <label htmlFor="imageSourceInput">ID:</label>
        <input
          id="imageSourceInput"
          type="text"
          value={imageSource}
          onChange={handleImageChange}
        />
      </div> */}

      <Cropper
        ratio={`${imageSize.width}:${imageSize.height}`}
        width={imageSize.width}
        height={imageSize.height}
        id={selectedFile.hash}
      >
        <img
          src={`${API_BASE_URL}/${project}/${selectedFile.hash}/resize@width:800;/img.jpg`}
          alt="random"
        />
      </Cropper>
    </div>
  );
}

export default Crop;
