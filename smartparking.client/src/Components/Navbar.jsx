import React from "react";
import "../../css/Navbar.css";
import logo from "../assets/icons8-parking-50.png"; 

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Left Side */}
      <div className="nav-left">
        <img src={logo} className="logo" alt="SmartPark Logo" />

        <div className="app-text">
          <h2 className="title">
            Smart<span>Park</span>
          </h2>
          <p className="subtitle">🚗 Smart Parking India</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="nav-right">
        <div className="notification">
          <i className="bell">🔔</i>
          <span className="badge">3</span>
        </div>

        <div className="profile">JD</div>
      </div>
    </nav>
  );
}
