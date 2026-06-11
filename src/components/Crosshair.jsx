import React, { useState, useEffect, useRef } from "react";

export default function Crosshair() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [masks, setMasks] = useState([]);

  useEffect(() => {
    const updateMasks = () => {
      const elements = document.querySelectorAll(".crosshair-mask");
      const rects = Array.from(elements).map((el) =>
        el.getBoundingClientRect(),
      );
      setMasks(rects);
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      updateMasks();
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  // Build horizontal line segments: skip any mask whose vertical span contains mousePos.y
  const hSegments = buildHorizontalSegments(mousePos, masks);
  // Build vertical line segments: skip any mask whose horizontal span contains mousePos.x
  const vSegments = buildVerticalSegments(mousePos, masks);

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

function buildHorizontalSegments(mousePos, masks) {
  const viewportWidth = window.innerWidth;

  // Find masks that block the horizontal line (their vertical range contains mousePos.y)
  const blocking = masks.filter(
    (r) => mousePos.y >= r.top && mousePos.y <= r.bottom,
  );

  if (blocking.length === 0) {
    return [{ start: 0, end: viewportWidth }];
  }

  // Merge overlapping blocked x-ranges
  const blocked = mergeRanges(
    blocking.map((r) => ({ start: r.left, end: r.right })),
  );

  // Build segments in the gaps
  return buildSegments(blocked, 0, viewportWidth);
}

function buildVerticalSegments(mousePos, masks) {
  const viewportHeight = window.innerHeight;

  // Find masks that block the vertical line (their horizontal range contains mousePos.x)
  const blocking = masks.filter(
    (r) => mousePos.x >= r.left && mousePos.x <= r.right,
  );

  if (blocking.length === 0) {
    return [{ start: 0, end: viewportHeight }];
  }

  // Merge overlapping blocked y-ranges
  const blocked = mergeRanges(
    blocking.map((r) => ({ start: r.top, end: r.bottom })),
  );

  // Build segments in the gaps
  return buildSegments(blocked, 0, viewportHeight);
}

function mergeRanges(ranges) {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i].start <= last.end) {
      last.end = Math.max(last.end, sorted[i].end);
    } else {
      merged.push(sorted[i]);
    }
  }
  return merged;
}

function buildSegments(blocked, rangeStart, rangeEnd) {
  const segments = [];
  let cursor = rangeStart;
  for (const block of blocked) {
    if (cursor < block.start) {
      segments.push({ start: cursor, end: block.start });
    }
    cursor = block.end;
  }
  if (cursor < rangeEnd) {
    segments.push({ start: cursor, end: rangeEnd });
  }
  return segments;
}
