import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './Header.css';

const Header = ({ toggleSidebar, sidebarOpen, pageTitle, userInfo, onLogout, languageSlider }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // Initialize the navigate function

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Toggle language - Keep this for backward compatibility
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
    // Close dropdown after changing language
    setDropdownOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    setDropdownOpen(false);
    
    // Call the original onLogout function if it exists
    if (onLogout) {
      onLogout();
    }
    
    // Navigate to the home page
    navigate('/');
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        {/* Sidebar toggle button */}
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? '⇤' : '☰'}
        </button>

        {/* Page title */}
        <h1 className="page-title">Clairo</h1>
      </div>

      <div className="header-right">
        {/* Language slider - Show if provided, otherwise fallback to button */}
        {languageSlider ? (
          <div className="language-slider-container">
            {languageSlider}
          </div>
        ) : (
          <button className="language-button" onClick={toggleLanguage}>
            {i18n.language === 'en' ? 'தமிழ்' : 'English'}
          </button>
        )}

        {/* User dropdown */}
        <div className="user-dropdown">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <div className="user-avatar">
              {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="user-name">{userInfo?.name || t('attorney')}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/dashboard/profile'); // Use navigate instead of window.location
                }}
              >
                <span className="item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
                <span className="item-text">{t('Profile')}</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/dashboard/settings'); // Use navigate instead of window.location
                }}
              >
                <span className="item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span>
                <span className="item-text">{t('Settings')}</span>
              </button>

              <div className="dropdown-divider"></div>

              <button
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <span className="item-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </span>
                <span className="item-text">{t('signout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;