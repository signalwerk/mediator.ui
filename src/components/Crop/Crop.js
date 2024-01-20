import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useRef,
} from "react";
import "./Crop.css";
import Button from "../Button";

import { API_BASE_URL } from "../../config";

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(
    () => console.log("Path copied to clipboard"),
    (err) => console.error("Error copying text: ", err)
  );
};

function calculateGPStoDecimal(valueArray) {
  const degrees = valueArray[0][0] / valueArray[0][1];
  const minutes = valueArray[1][0] / valueArray[1][1];
  const seconds = valueArray[2][0] / valueArray[2][1];

  return degrees + minutes / 60 + seconds / 3600;
}

const handleButtonClick = async (data) => {
  try {
    const markdownText = await generateMarkdownLinkWithDate(data);
    copyToClipboard(markdownText);
  } catch (error) {
    console.error("Error generating markdown:", error);
  }
};

async function generateMarkdownLinkWithDate(pictureData) {
  const text = [];

  // Extracting the date and geo-position from the picture data
  const dateTimeOriginal = pictureData?.meta?.exif?.DateTimeOriginal?.value[0];

  if (dateTimeOriginal) {
    // Formatting the date as dd.mm.yyyy hh.mm
    const formattedDate = dateTimeOriginal.replace(
      /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
      "$3. $2. $1 $4:$5"
    );
    text.push(formattedDate);
  }

  const latitudeData = pictureData?.meta?.exif?.GPSLatitude?.value;
  const longitudeData = pictureData?.meta?.exif?.GPSLongitude?.value;

  if (latitudeData && longitudeData) {
    // Calculating the decimal latitude and longitude
    const latitude = calculateGPStoDecimal(latitudeData);
    //    latitudeData[0][0] + latitudeData[1][0] / 60 + latitudeData[2][0] / 3600;
    const longitude = calculateGPStoDecimal(longitudeData);
    //    longitudeData[0][0] + longitudeData[1][0] / 60 + longitudeData[2][0] / 3600;

    // Constructing the Google Maps link
    const googleMapsLink = `https://www.google.com/maps/place/${latitude},${longitude}`;

    text.push(`[Map](${googleMapsLink})`);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    try {
      const response = await fetch(nominatimUrl);
      const data = await response.json();

      console.log({ data });

      const address = data.display_name; // or any other detail you need from the response

      if (address) {
        text.push(`Address: ${address}`);
      }
    } catch (error) {
      console.error("Error fetching address information:", error);
    }
  }
  // Constructing the markdown text

  return text.join(" · ");
}

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
          {children}
          <ResizableDiv />
          <CropperInfo width={width} height={height} id={id} />
        </div>
      </div>
    </div>
  );
};

function Root(props) {
  return (
    <CropProvider>
      <Crop {...props} />
    </CropProvider>
  );
}

function generateUrl({ project, hash, crop, rotationAngle, width }) {
  const base = project ? `${API_BASE_URL}/${project}/` : "";
  const hashString = hash ? `${hash}/` : "";

  const rotate = rotationAngle ? `rotate@angle:${rotationAngle};` : "";
  const cropString = crop
    ? `crop@left:${crop.x},top:${crop.y},width:${crop.width},height:${crop.height};`
    : "";
  const resize = width ? `resize@width:${width};` : "";

  return `${base}${hashString}${rotate}${cropString}${resize}`;
}

function Crop({ project, selectedFile, onClose }) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [data, setData] = useState(null);

  const { rotationAngle, setRotationAngle } = useContext(CropContext);

  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        const response = await fetch(
          `${generateUrl({
            project,
            hash: selectedFile.hash,
            width: 250,
          })}/img.json`
        );
        const data = await response.json();
        setData(data);

        if (rotationAngle) {
          // Convert rotation angle to radians for calculation
          const angleRadians = (rotationAngle * Math.PI) / 180;

          // Calculate the new dimensions of the rotated image
          const rotatedWidth =
            Math.abs(data.meta.normalizedWidth * Math.cos(angleRadians)) +
            Math.abs(data.meta.normalizedHeight * Math.sin(angleRadians));
          const rotatedHeight =
            Math.abs(data.meta.normalizedWidth * Math.sin(angleRadians)) +
            Math.abs(data.meta.normalizedHeight * Math.cos(angleRadians));

          setImageSize({
            width: rotatedWidth,
            height: rotatedHeight,
          });
        } else {
          setImageSize({
            width: data.meta.normalizedWidth,
            height: data.meta.normalizedHeight,
          });
        }
      } catch (error) {
        console.error("Error fetching image size:", error);
      }
    };

    fetchImageSize();
  }, [selectedFile.hash, project, rotationAngle]); // Add rotationAngle as a dependency

  if (!data) return null;

  return (
    <div className="crop">
      <input
        type="number"
        min="0"
        max="360"
        step="0.2"
        value={rotationAngle}
        onChange={(e) => setRotationAngle(e.target.value)}
      />
      <Button className="button" onClick={() => handleButtonClick(data)}>
        Copy MD position and time
      </Button>
      <Cropper
        ratio={`${imageSize.width}:${imageSize.height}`}
        width={imageSize.width}
        height={imageSize.height}
        id={selectedFile.hash}
      >
        <img
          src={`${generateUrl({
            project,
            hash: selectedFile.hash,
            rotationAngle,
            width: 800,
          })}/img.jpg`}
          alt="random"
        />
      </Cropper>
    </div>
  );
}

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
  const [rotationAngle, setRotationAngle] = useState(0);

  const value = {
    cropDimensions,
    setCropDimensions,
    isShiftPressed,
    setIsShiftPressed,
    lockedRatio,
    setLockedRatio,
    rotationAngle,
    setRotationAngle,
  };

  return <CropContext.Provider value={value}>{children}</CropContext.Provider>;
};

const CropperInfo = ({
  respectsBounds = true,
  aspectRatio = 1.666,
  width,
  height,
  id,
}) => {
  const {
    cropDimensions,
    rotationAngle,
    // setCropDimensions,
    // isShiftPressed,
    // setIsShiftPressed,
    // lockedRatio,
    // setLockedRatio,
  } = useContext(CropContext);

  const copyToClipboard = () => {
    const crop = generateUrl({
      crop: {
        x: cropDimensions.x * width,
        y: cropDimensions.y * height,
        width: cropDimensions.width * width,
        height: cropDimensions.height * height,
      },
      rotationAngle,
    });

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
        <li>angle: {rotationAngle}</li>
        <li>
          <button onClick={copyToClipboard}>Copy Crop</button>
        </li>
      </ul>
    </div>
  );
};

const ResizableDiv = ({ respectsBounds = true, aspectRatio = 1.666 }) => {
  const {
    cropDimensions,
    setCropDimensions,
    isShiftPressed,
    setIsShiftPressed,
    lockedRatio,
    setLockedRatio,
  } = useContext(CropContext);
  const resizableDivRef = useRef(null);

  const handleMove = (startX, startY) => {
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    document.body.style.cursor = "move"; // Change cursor to move during drag

    function mouseMoveHandler(e) {
      const moveX = e.clientX - startX;
      const moveY = e.clientY - startY;

      let newX = moveX / resizableDivRef.current.parentElement.offsetWidth;
      let newY = moveY / resizableDivRef.current.parentElement.offsetHeight;

      if (respectsBounds) {
        newX = Math.max(0, Math.min(newX, 1 - cropDimensions.width));
        newY = Math.max(0, Math.min(newY, 1 - cropDimensions.height));
      }

      setCropDimensions((d) => ({
        ...d,
        x: newX,
        y: newY,
      }));
    }

    function mouseUpHandler() {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      document.body.style.cursor = "auto"; // Reset cursor after drag
    }
  };

  const handleResize = (direction, parentBounds) => {
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    function mouseMoveHandler(e) {
      const relativeX = e.clientX - parentBounds.left;
      const relativeY = e.clientY - parentBounds.top;

      const parentWidth = parentBounds.width;
      const parentHeight = parentBounds.height;

      let newX = cropDimensions.x;
      let newY = cropDimensions.y;
      let newWidth = cropDimensions.width;
      let newHeight = cropDimensions.height;

      switch (direction) {
        case "s":
          newHeight = relativeY / parentHeight - newY;

          break;
        case "n":
          newHeight = newHeight - (relativeY / parentHeight - newY);
          newY = relativeY / parentHeight;

          break;
        case "e":
          newWidth = relativeX / parentWidth - newX;

          break;
        case "w":
          newWidth = newWidth - (relativeX / parentWidth - newX);
          newX = relativeX / parentWidth;

          break;
        case "nw":
          newWidth = newWidth - (relativeX / parentWidth - newX);
          newHeight = newHeight - (relativeY / parentHeight - newY);
          newX = relativeX / parentWidth;
          newY = relativeY / parentHeight;

          break;
        case "ne":
          newWidth = relativeX / parentWidth - newX;
          newHeight = newHeight - (relativeY / parentHeight - newY);
          newY = relativeY / parentHeight;

          break;
        case "se":
          newWidth = relativeX / parentWidth - newX;
          newHeight = relativeY / parentHeight - newY;

          break;
        case "sw":
          newWidth = newWidth - (relativeX / parentWidth - newX);
          newHeight = relativeY / parentHeight - newY;
          newX = relativeX / parentWidth;

          break;
        default:
          break;
      }

      if (respectsBounds) {
        newWidth = Math.min(newWidth, 1 - newX);
        newHeight = Math.min(newHeight, 1 - newY);

        if (newX < 0) {
          newWidth = newWidth + newX;
          newX = 0;
        }
        if (newY < 0) {
          newHeight = newHeight + newY;
          newY = 0;
        }
      }

      if (isShiftPressed && lockedRatio) {
        // Adjust newWidth and newHeight according to the lockedRatio
        if (["n", "s"].includes(direction)) {
          newWidth = newHeight * lockedRatio;
        } else if (["e", "w"].includes(direction)) {
          newHeight = newWidth / lockedRatio;
        } else {
          // Diagonal resizing
          // Calculate new dimensions keeping ratio
          const newWidthFromHeight = newHeight * lockedRatio;
          const newHeightFromWidth = newWidth / lockedRatio;

          // Determine which dimension adjustment is smaller
          const widthDiff = Math.abs(newWidth - newWidthFromHeight);
          const heightDiff = Math.abs(newHeight - newHeightFromWidth);

          // Adjust the dimension with the smallest difference to keep the opposite point fixed
          if (widthDiff < heightDiff) {
            newWidth = newWidthFromHeight;
          } else {
            newHeight = newHeightFromWidth;
          }

          // When handling top corners, we should adjust the position (x, y) as well
          if (direction === "nw") {
            newY = newY + newHeight - cropDimensions.height;
            newX = newX + newWidth - cropDimensions.width;
          } else if (direction === "ne") {
            newY = newY + newHeight - cropDimensions.height;
          }
        }
      }

      setCropDimensions((d) => ({
        ...d,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      }));
    }

    function mouseUpHandler() {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Shift") {
        setIsShiftPressed(true);
        const ratio = cropDimensions.width / cropDimensions.height;
        console.log({ ratio });
        setLockedRatio(ratio);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [cropDimensions, setLockedRatio, setIsShiftPressed]); // Added dependencies here

  const adjustToRatio = (newAspectRatio) => {
    const parentBounds =
      resizableDivRef.current.parentElement.getBoundingClientRect();

    const parentWidth = parentBounds.width;
    const parentHeight = parentBounds.height;

    let newWidth = cropDimensions.width * parentWidth;
    let newHeight = (cropDimensions.width * parentWidth) / newAspectRatio;

    if (respectsBounds) {
      // Check if the new dimensions would exceed the parent's bounds
      if (newHeight + cropDimensions.y * parentHeight > parentHeight) {
        newHeight = parentHeight - cropDimensions.y * parentHeight;
        newWidth = newHeight * newAspectRatio;
      }

      if (newWidth + cropDimensions.x * parentWidth > parentWidth) {
        newWidth = parentWidth - cropDimensions.x * parentWidth;
        newHeight = newWidth / newAspectRatio;
      }
    }

    setCropDimensions((d) => ({
      ...d,
      width: newWidth / parentWidth,
      height: newHeight / parentHeight,
    }));
  };

  return (
    <div
      ref={resizableDivRef}
      onMouseDown={(e) => {
        const startX =
          e.clientX -
          cropDimensions.x * resizableDivRef.current.parentElement.offsetWidth;
        const startY =
          e.clientY -
          cropDimensions.y * resizableDivRef.current.parentElement.offsetHeight;
        handleMove(startX, startY);
      }}
      style={{
        position: "absolute",
        left: `${cropDimensions.x * 100}%`,
        top: `${cropDimensions.y * 100}%`,
        width: `${cropDimensions.width * 100}%`,
        height: `${cropDimensions.height * 100}%`,
        border: "1px solid black",
      }}
    >
      {aspectRatio && (
        <>
          <button onClick={() => adjustToRatio(aspectRatio)}>
            Ratio {aspectRatio}
          </button>
          <br />
        </>
      )}
      <button onClick={() => adjustToRatio(3 / 2)}>Ratio 3 / 2</button>
      <br />
      <button onClick={() => adjustToRatio(2 / 3)}>Ratio 2 / 3</button>
      <br />
      <button onClick={() => adjustToRatio(16 / 9)}>Ratio 16 / 9</button>
      <br />

      {["n", "s", "e", "w", "nw", "ne", "se", "sw"].map((dir) => (
        <div
          key={dir}
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent the parent's onMouseDown from triggering
            handleResize(
              dir,
              resizableDivRef.current.parentElement.getBoundingClientRect()
            );
          }}
          style={{
            width: "10px",
            height: "10px",
            background: "blue",
            position: "absolute",
            cursor: `${dir}-resize`,
            ...getNotchPosition(dir),
          }}
        />
      ))}
    </div>
  );
};

function getNotchPosition(direction) {
  const vertical = direction.includes("n")
    ? "top"
    : direction.includes("s")
    ? "bottom"
    : null;
  const horizontal = direction.includes("w")
    ? "left"
    : direction.includes("e")
    ? "right"
    : null;

  const style = {};

  if (vertical) style[vertical] = "-5px";
  if (horizontal) style[horizontal] = "-5px";

  if (!vertical) style.top = "calc(50% - 5px)";
  if (!horizontal) style.left = "calc(50% - 5px)";

  return style;
}

export default Root;
