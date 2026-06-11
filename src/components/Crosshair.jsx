import React, { useState, useEffect } from "react";

export default function Crosshair() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredMask, setHoveredMask] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Find which mask (if any) is directly under the cursor
      const elements = document.querySelectorAll(".crosshair-mask");
      let foundMask = null;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          foundMask = rect;
          break;
        }
      }

      setHoveredMask(foundMask);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setHoveredMask(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  // Build horizontal line segments: only skip the hovered mask
  const hSegments = buildHorizontalSegments(mousePos, hoveredMask);
  // Build vertical line segments: only skip the hovered mask
  const vSegments = buildVerticalSegments(mousePos, hoveredMask);

  return (
    <>
      {hSegments.map((seg, i) => (
        <div
          key={"h" + i}
          style={{
            position: "fixed",
            top: mousePos.y,
            left: seg.start,
            width: seg.end - seg.start,
            height: "1px",
            backgroundColor: "rgba(200, 200, 200, 0.5)",
            transform: "translateY(-0.5px)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      ))}
      {vSegments.map((seg, i) => (
        <div
          key={"v" + i}
          style={{
            position: "fixed",
            top: seg.start,
            left: mousePos.x,
            height: seg.end - seg.start,
            width: "1px",
            backgroundColor: "rgba(200, 200, 200, 0.5)",
            transform: "translateX(-0.5px)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      ))}
    </>
  );
}

function buildHorizontalSegments(mousePos, hoveredMask) {
  const viewportWidth = window.innerWidth;

  if (!hoveredMask) {
    return [{ start: 0, end: viewportWidth }];
  }

  // Only block if the hovered mask's vertical range contains mousePos.y
  if (mousePos.y < hoveredMask.top || mousePos.y > hoveredMask.bottom) {
    return [{ start: 0, end: viewportWidth }];
  }

  // Build segments around the single hovered mask
  const segments = [];
  if (hoveredMask.left > 0) {
    segments.push({ start: 0, end: hoveredMask.left });
  }
  if (hoveredMask.right < viewportWidth) {
    segments.push({ start: hoveredMask.right, end: viewportWidth });
  }

  return segments.length > 0 ? segments : [{ start: 0, end: viewportWidth }];
}

function buildVerticalSegments(mousePos, hoveredMask) {
  const viewportHeight = window.innerHeight;

  if (!hoveredMask) {
    return [{ start: 0, end: viewportHeight }];
  }

  // Only block if the hovered mask's horizontal range contains mousePos.x
  if (mousePos.x < hoveredMask.left || mousePos.x > hoveredMask.right) {
    return [{ start: 0, end: viewportHeight }];
  }

  // Build segments around the single hovered mask
  const segments = [];
  if (hoveredMask.top > 0) {
    segments.push({ start: 0, end: hoveredMask.top });
  }
  if (hoveredMask.bottom < viewportHeight) {
    segments.push({ start: hoveredMask.bottom, end: viewportHeight });
  }

  return segments.length > 0 ? segments : [{ start: 0, end: viewportHeight }];
}
