import React from "react";
import { FiCloud, FiSettings, FiMap } from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <FiCloud size={28} />
      </div>
      <nav className="sidebar-nav">
        <button
          className={`nav-btn ${activePage === "weather" ? "active" : ""}`}
          onClick={() => setActivePage("weather")}
          title="Weather"
        >
          <FiMap size={22} />
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
