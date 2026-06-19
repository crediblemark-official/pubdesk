import React from 'react';

const TopBar: React.FC = () => {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <button className="icon-btn">🔍</button>
        <div className="title">
          <strong>Files</strong>
        </div>
        <button className="icon-btn">☰</button>
      </div>
      <div className="top-bar-center">
        <button className="icon-btn">←</button>
        <button className="icon-btn">→</button>
        <div className="path-breadcrumb">
          <span className="path-icon">🏠</span>
          <span className="path-text">Home</span>
        </div>
        <button className="icon-btn">⋮</button>
      </div>
      <div className="top-bar-right">
        <button className="icon-btn">📸</button>
        <button className="icon-btn">🔄</button>
        <div className="view-toggle">
          <button className="icon-btn">⊞</button>
          <button className="icon-btn">☰</button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
