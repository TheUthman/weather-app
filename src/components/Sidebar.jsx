/* eslint-disable no-unused-vars */
import React from "react";
import { FiCloud, FiSettings, FiMap } from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/WRLogo.png" alt="Weather Radar Logo" />
      </div>
      <nav className="sidebar-nav">
        <button
          className={`nav-btn ${activePage === "weather" ? "active" : ""}`}
          onClick={() => setActivePage("weather")}
          title="Weather"
        >
          <FiCloud size={22} />
        </button>
        <button
          className={`nav-btn ${activePage === "settings" ? "active" : ""}`}
          onClick={() => setActivePage("settings")}
          title="Settings"
        >
          <FiSettings size={22} />
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
