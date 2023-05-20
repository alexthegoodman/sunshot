import * as React from "react";

import { TrackItemProps } from "./TrackItem.d";

import { motion } from "framer-motion";

let listenerAttached = 0;

const TrackItem: React.FC<TrackItemProps> = ({
  constraintsRef = null,
  track = null,
  originalDuration = 1,
  handleClick = () => console.info("handleClick"),
  updateTrack = () => console.info("updateTrack"),
}) => {
  const { id, start, end, zoomFactor } = track;
  const width = ((end - start) / originalDuration) * 100;
  // const width = (end / originalDuration) * 100;
  const left = (start / originalDuration) * 100;

  const [translating, setTranslating] = React.useState(false);
  const [resizingLeft, setResizingLeft] = React.useState(false);
  const [resizingRight, setResizingRight] = React.useState(false);
  const [withinLeft, setWithinLeft] = React.useState(false);

  // TODO: esc key should cancel any dragging

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const wrapper = document.getElementById("videoTrackWrapper");
      const targetTrackItem = document.getElementById(id);
      const clickAreaOffset = 200;

      //   console.info("mouse  move", targetTrackItem, translating);

      if (!targetTrackItem) return;

      //   console.info("targetTrackItem", targetTrackItem);

      const wrapperRect = wrapper.getBoundingClientRect();
      const targetTrackItemRect = targetTrackItem.getBoundingClientRect();
      const { left, right, width } = targetTrackItemRect;
      const {
        left: wrapperLeft,
        right: wrapperRight,
        width: wrapperWidth,
      } = wrapperRect;

      const pixelPerMs = originalDuration / wrapperWidth;
      const msPerPixel = wrapperWidth / originalDuration;
      const baseX = clientX - 200; // -200 to account for offset
      const totalX = left + (clientX - left);

      if (translating) {
        const pixelsForX = baseX * pixelPerMs;
        const clientXMs = baseX * pixelPerMs;
        const widthMs = width * pixelPerMs;
        // console.info("msForX", clientX, pixelPerMs, clientXMs, width);
        const newStart = Math.floor(clientXMs);
        const newEnd = Math.floor(newStart + widthMs); // dont add width to ms times, convert width to ms
        updateTrack(
          track.id,
          "",
          [
            { key: "start", value: newStart },
            { key: "end", value: newEnd },
          ],
          true
        );
      }
      if (resizingLeft) {
        const newWidth = width - (clientX - left);
        const newLeft = left + (clientX - left);
        // targetTrackItem.style.width = `${newWidth}px`;
        // targetTrackItem.style.left = `${newLeft}px`;
        const newStart = Math.floor(newLeft * msPerPixel);
        // console.info("newStart", newStart, newLeft, msPerPixel);
        updateTrack(track.id, "start", newStart - clickAreaOffset);
      }
      if (resizingRight) {
        const newWidth = width + (clientX - right);
        // targetTrackItem.style.width = `${newWidth}px`;
        const leftSpace = left + newWidth;
        const newEnd = Math.floor(leftSpace * msPerPixel);
        updateTrack(track.id, "end", newEnd + clickAreaOffset);
      }
    };

    listenerAttached++;
    console.info("attach mousemove listener", listenerAttached);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      listenerAttached--;
      console.info("detaching mousemove listener");
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [translating, resizingLeft, resizingRight]);

  const leftHandleDown = (e) => {
    console.info("leftHandleDown");
    setResizingLeft(true);
  };

  const leftHandleUp = () => {
    console.info("leftHandleUp");
    setResizingLeft(false);
  };

  const leftHandleEnter = () => {
    console.info("leftHandleEnter");
    setWithinLeft(true);
  };

  const leftHandleLeave = () => {
    console.info("leftHandleLeave");
    setWithinLeft(false);
    setResizingLeft(false);
  };

  const itemHandleDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.info("itemHandleDown");
    setTranslating(true);
  };

  const itemHandleUp = () => {
    console.info("itemHandleUp");
    setTranslating(false);
  };

  const itemHandleEnter = () => {
    console.info("itemHandleEnter");
  };

  const itemHandleLeave = () => {
    console.info("itemHandleLeave");
    setTranslating(false);
  };

  const rightHandleDown = () => {
    console.info("rightHandleDown");
    setResizingRight(true);
  };

  const rightHandleUp = () => {
    console.info("rightHandleUp");
    setResizingRight(false);
  };

  //   const itemDragEnd = (e, info) => {
  //     console.info("itemDragEnd", info);
  //     const wrapper = document.getElementById("videoTrackWrapper");
  //     const wrapperRect = wrapper.getBoundingClientRect();
  //     const {
  //       left: wrapperLeft,
  //       right: wrapperRight,
  //       width: wrapperWidth,
  //     } = wrapperRect;

  //     const msPerPixel = originalDuration / wrapperWidth;

  //     const { point } = info;
  //     const { x } = point;

  //     console.info("x", x, msPerPixel);

  //     const newStart = x * msPerPixel;
  //     const newEnd = Math.floor(x + width);
  //     updateTrack(track.id, "start", newStart);
  //     // updateTrack(track.id, "end", newEnd);
  //   };

  return (
    <div
      //   drag={resizingLeft || resizingRight ? false : "x"}
      //   dragConstraints={constraintsRef}
      //   onDragEnd={itemDragEnd}
      key={id}
      id={id}
      className={"item"}
      style={{
        left: `${left}%`, // conflicts with drag?
        width: `${width}%`,
      }}
      onClick={() => handleClick(id)}
    >
      <div
        className="leftHandle"
        onMouseDown={leftHandleDown}
        onMouseUp={leftHandleUp}
        // onMouseEnter={leftHandleEnter}
        // onMouseLeave={leftHandleLeave}
      ></div>
      <div
        className="itemHandle"
        onMouseDown={itemHandleDown}
        onMouseUp={itemHandleUp}
        onMouseEnter={itemHandleEnter}
        onMouseLeave={itemHandleLeave}
      >
        <span className="name">{track.name}</span>
      </div>
      <div
        className="rightHandle"
        onMouseDown={rightHandleDown}
        onMouseUp={rightHandleUp}
      ></div>
    </div>
  );
};

export default TrackItem;
