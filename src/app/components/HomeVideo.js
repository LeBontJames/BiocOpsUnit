import React, { useEffect, useRef } from "react";

export default function HomeVideo({ paused }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [paused]);

  return (
    <video
      ref={videoRef}
      src="/Sequenza 01.mp4"
      width={38}
      height={22}
      style={{ display: "block", width: "38px", height: "22px", objectFit: "cover", opacity: 0.7, cursor: "not-allowed", transform: "rotate(-20deg)", animation: "none", transition: "none" }}
      autoPlay
      loop
      muted
      playsInline
      tabIndex={-1}
      aria-disabled="true"
    />
  );
}
