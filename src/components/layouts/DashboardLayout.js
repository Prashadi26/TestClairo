import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./DashboardLayout.css";

const Sidebar = React.lazy(() => import("../navigation/Sidebar")); // Lazy load Sidebar
const Header = React.lazy(() => import("../navigation/Header")); // Lazy load Header
const LanguageSlider = React.lazy(() => import("./LanguageSlider")); // Lazy load LanguageSlider

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
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
      if (!isMobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prevState) => !prevState);
  }, []);

  const handleNavigation = useCallback(
    (path) => {
      navigate(path);
      if (mobileView) {
        setSidebarOpen(false);
      }
    },
    [mobileView, navigate]
  );

  const getPageTitle = useMemo(() => {
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
  }, [location.pathname, t]);

  return (
    <div className="dashboard-layout">
      <React.Suspense fallback={<div>Loading Sidebar...</div>}>
        <Sidebar
          isOpen={sidebarOpen}
          currentPath={location.pathname}
          onNavigation={handleNavigation}
          userInfo={userInfo}
          onLogout={onLogout}
        />
      </React.Suspense>

      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <React.Suspense fallback={<div>Loading Header...</div>}>
          <Header
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
            pageTitle={getPageTitle}
            userInfo={userInfo}
            onLogout={onLogout}
            languageSlider={<LanguageSlider />}
          />
        </React.Suspense>

        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {mobileView && sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default React.memo(DashboardLayout);
