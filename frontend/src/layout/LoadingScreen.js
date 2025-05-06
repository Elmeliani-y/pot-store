import React from 'react';
import logo from '../Images/tudert.png';

const LoadingScreen = () => (
  <div className="loading-screen">
    <img src={logo} alt="Site Logo" className="loading-logo" />
    <div className="loading-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  </div>
);

export default LoadingScreen;