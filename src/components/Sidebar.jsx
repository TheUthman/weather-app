import { memo } from "react";
import { NavLink } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCloud,
  FiSearch,
  FiSettings,
} from "react-icons/fi";
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

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}
      aria-label="Primary navigation"
    >
      <div className="sidebar-inner">
        <div className="sidebar-header">
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

          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <FiChevronRight size={18} />
            ) : (
              <FiChevronLeft size={18} />
            )}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-btn ${isActive ? "active" : ""}`
              }
              data-tooltip={item.label}
              aria-label={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-footer-dot" />
          <span className="sidebar-footer-text">Live sky visuals</span>
        </div>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
