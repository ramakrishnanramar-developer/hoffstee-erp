import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getSidebarModules } from "../services/authService";
import {
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiFileText
} from "react-icons/fi";
import { iconMap } from "../utils/iconMap";
import "./Sidebar.css";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
  const [modules, setModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [expandedSubMenu, setExpandedSubMenu] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await getSidebarModules();
        const raw = response?.output || [];
        setModules(raw);

        // Auto-expand based on current path
        const currentPath = location.pathname;
        for (const mod of raw) {
          for (const sub of mod.subMenus || []) {
            for (const page of sub.pages || []) {
              if (page.pageURL === currentPath) {
                setExpandedModule(mod.name);
                setExpandedSubMenu(sub.name);
                return;
              }
            }
          }
        }
      } catch {
        console.error("Failed to load sidebar modules.");
      }
    };
    fetchModules();
  }, [location.pathname]);


  const toggleModule = (name) => {
    setExpandedModule(prev => (prev === name ? null : name));
    setExpandedSubMenu(null);
  };

  const toggleSubMenu = (name) => {
    setExpandedSubMenu(prev => (prev === name ? null : name));
  };

  return (
    <aside className="erp-sidebar">
      <div className="sidebar-header">Hoffstee ERP</div>

      <nav className="sidebar-menu">
        {modules.map((module, modIndex) => {
          const ModuleIcon = iconMap[module.name] || <FiFileText />;
          return (
            <div key={modIndex} className="sidebar-group">
              <div className="sidebar-category" onClick={() => toggleModule(module.name)}>
                <div className="category-left">
                  <span className="module-icon">{ModuleIcon}</span>
                  <span className="category-label">{module.name}</span>
                </div>
                <div className="category-right">
                  {expandedModule === module.name ? (
                    <FiChevronUp className="arrow-icon" />
                  ) : (
                    <FiChevronDown className="arrow-icon" />
                  )}
                </div>
              </div>


              {expandedModule === module.name && (
                <div className="sidebar-submenus">
                  {module.subMenus?.map((sub, subIndex) => (
                    <div key={subIndex} className="sidebar-subgroup">
                      <div className="sidebar-subheading" onClick={() => toggleSubMenu(sub.name)}>
                        <span>{sub.name}</span>
                        {expandedSubMenu === sub.name ? (
                          <FiChevronDown className="arrow-icon" />
                        ) : (
                          <FiChevronRight className="arrow-icon" />
                        )}
                      </div>

                      {expandedSubMenu === sub.name && (
                        <div className="sidebar-pages">
                          {sub.pages?.map((page, pageIndex) => {
                            const Icon = iconMap[sub.name] || <FiFileText />;
                            return (
                              <NavLink
                                key={pageIndex}
                                to={page.pageURL}
                                className={({ isActive }) =>
                                  `sidebar-link ${isActive ? "active" : ""}`
                                }
                              >
                                <span className="sidebar-icon">{Icon}</span>
                                <span className="sidebar-label">{page.name}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

     
    </aside>
  );
};

export default Sidebar;