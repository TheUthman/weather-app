/* eslint-disable no-unused-vars */
import { memo } from "react";
import { NavLink } from "react-router-dom";
import { FiCloud, FiSettings, FiMap } from "react-icons/fi";
import "../styles/Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/WRLogo.png" alt="Weather Radar Logo" />
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
          title="Weather"
        >
          <FiCloud size={22} />
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
          title="Settings"
        >
          <FiSettings size={22} />
        </NavLink>
      </nav>
    </aside>
  );
};

export default memo(Sidebar);
