import { memo } from "react";
import { NavLink } from "react-router-dom";
import { FiCloud, FiSearch, FiSettings } from "react-icons/fi";
import "../styles/Sidebar.css";

const navItems = [
  {
    to: "/",
    label: "Weather",
    icon: <FiCloud size={20} />,
  },
  {
    to: "/search",
    label: "Search",
    icon: <FiSearch size={20} />,
  },
  {
    to: "/settings",
    label: "Settings",
    icon: <FiSettings size={20} />,
  },
];

const Sidebar = () => {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-inner">
        <NavLink
          to="/"
          className="sidebar-brand"
          aria-label="Go to weather dashboard"
        >
          <span className="sidebar-brand-mark">
            <img src="/WRLogo.png" alt="Weather Radar Logo" />
          </span>
          <span className="sidebar-brand-copy">
            <strong>Weather Radar</strong>
            <small>Sky dashboard</small>
          </span>
        </NavLink>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-btn ${isActive ? "active" : ""}`
              }
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-footer-dot" />
          Live sky visuals
        </div>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
