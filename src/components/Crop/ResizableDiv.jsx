import React, { useContext, useRef, useEffect } from "react";
import { CropContext } from "./CropContext";

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

// function getDimensionsKeepingRatio(
//   mouseX,
//   mouseY,
//   parentBounds,
//   direction,
//   lockedRatio,
//   cropDimensions
// ) {
//   const relativeX = mouseX - parentBounds.left;
//   const relativeY = mouseY - parentBounds.top;

//   let newX = cropDimensions.x;
//   let newY = cropDimensions.y;
//   let newWidth = cropDimensions.width;
//   let newHeight = cropDimensions.height;

//   switch (direction) {
//     case "ne":
//       newHeight =
//         cropDimensions.y +
//         cropDimensions.height -
//         relativeY / parentBounds.height;
//       newWidth = newHeight * lockedRatio;
//       newY = cropDimensions.y + cropDimensions.height - newHeight;
//       break;
//     case "nw":
//       newWidth =
//         cropDimensions.x +
//         cropDimensions.width -
//         relativeX / parentBounds.width;
//       newHeight = newWidth / lockedRatio;
//       newX = cropDimensions.x + cropDimensions.width - newWidth;
//       newY = cropDimensions.y + cropDimensions.height - newHeight;
//       break;
//     case "se":
//       newWidth = relativeX / parentBounds.width - cropDimensions.x;
//       newHeight = newWidth / lockedRatio;
//       break;
//     case "sw":
//       newHeight = relativeY / parentBounds.height - cropDimensions.y;
//       newWidth = newHeight * lockedRatio;
//       newX = cropDimensions.x + cropDimensions.width - newWidth;
//       break;
//     default:
//       break;
//   }

//   return {
//     newX,
//     newY,
//     newWidth,
//     newHeight,
//   };
// }

export default ResizableDiv;
