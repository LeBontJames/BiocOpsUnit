import React from "react";
import Image from "next/image";
import "../styles/home.css";

const BlackHoleModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="blackhole-modal-overlay" onClick={onClose}>
      <div className="blackhole-modal-content" onClick={e => e.stopPropagation()}>
        <button className="blackhole-modal-close" onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
};

export default BlackHoleModal;
