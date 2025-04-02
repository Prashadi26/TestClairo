import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import Header from "../navigation/Header";
import LanguageSlider from "./LanguageSlider";
import "./DashboardLayout.css";
import { useTranslation } from "react-i18next";

const DashboardLayout = ({ onLogout, userInfo }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setMobileView(isMobile);

      // Auto-close sidebar on mobile
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }

      // Auto-open sidebar on desktop
      if (!isMobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Toggle sidebar

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on navigation in mobile view
    if (mobileView) {
      setSidebarOpen(false);
    }
  };

  // Get the current page title
  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();

    switch (path) {
      case "dashboard":
        return t("dashboard");
      case "cases":
        return t("cases");
      case "clients":
        return t("clients");
      case "tasks":
        return t("tasks");
      case "calendar":
        return t("calendar");
      case "messaging":
        return t("messaging");
      case "profile":
        return t("profile");
      case "settings":
        return t("settings");
      default:
        return t("dashboard");
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        currentPath={location.pathname}
        onNavigation={handleNavigation}
        userInfo={userInfo}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        {/* Header with toggle button */}
        <Header
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          pageTitle={getPageTitle()}
          userInfo={userInfo}
          onLogout={onLogout}
          languageSlider={<LanguageSlider />}
        />

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {mobileView && sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default DashboardLayout;
