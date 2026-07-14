import { memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Icon from "./Icon";

const navItems = [
  {
    to: "/",
    label: "Weather",
    icon: <Icon name="cloud" size={20} />,
  },
  {
    to: "/search",
    label: "Search",
    icon: <Icon name="search" size={20} />,
  },
  {
    to: "/settings",
    label: "Settings",
    icon: <Icon name="settings" size={20} />,
  },
];

const Sidebar = ({ collapsed, visualStyle, onToggleCollapse }) => {
  const { pathname } = useLocation();

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
              <img
                src="/favicon.svg"
                alt="Weather Radar Logo"
                width="26"
                height="26"
                decoding="async"
              />
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
              <Icon name="chevronRight" size={18} />
            ) : (
              <Icon name="chevronLeft" size={18} />
            )}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                const isSettingsSection =
                  item.to === "/settings" && pathname === "/help";
                return `nav-btn ${isActive || isSettingsSection ? "active" : ""}`;
              }}
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
          <span className="sidebar-footer-text">
            {visualStyle === "minimal"
              ? "Weather film active"
              : "Animated sky active"}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default memo(Sidebar);
