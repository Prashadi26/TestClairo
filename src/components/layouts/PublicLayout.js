import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./PublicLayout.css";
import LanguageSlider from "./LanguageSlider"; // Import the language slider component

const PublicLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when clicking a link
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Check if on auth pages
  const isAuthPage =
    location.pathname.includes("/signin") ||
    location.pathname.includes("/signup") ||
    location.pathname.includes("/reset-password");

  return (
    <div className="public-layout">
      {/* Header/Navbar */}
      <header className="navbar">
        <div className="container navbar-container">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-text">Clairo</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "X" : "☰"}
          </button>

          {/* Navigation Links */}
          <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
            <ul className="nav-links">
              <li>
                <Link
                  to="/"
                  className={location.pathname === "/" ? "active" : ""}
                  onClick={closeMenu}
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/aboutUs"
                  className={location.pathname === "/aboutUs" ? "active" : ""}
                  onClick={closeMenu}
                >
                  {t("About Us")}
                </Link>
              </li>
            </ul>

            {/* Language Slider Toggle */}
            <LanguageSlider />

            {/* Auth Buttons */}
            <div className="auth-buttons">
              <Link
                to="/signin"
                className="button signin-button"
                onClick={closeMenu}
              >
                {t("signin")}
              </Link>
              <Link
                to="/signup"
                className="button signup-button"
                onClick={closeMenu}
              >
                {t("signup")}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={`public-main ${isAuthPage ? "auth-page-main" : ""}`}>
        <Outlet />
      </main>

      {/* Footer only on non-auth pages */}
      {!isAuthPage && (
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-logo">
                <span className="logo-text">Clairo</span>
              </div>
              <p className="footer-copyright">
                &copy; {new Date().getFullYear()} Clairo.{" "}
                {t("all_rights_reserved")}
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PublicLayout;
