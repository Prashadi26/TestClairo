import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = ({ toggleSidebar, sidebarOpen, pageTitle, userInfo, onLogout, languageSlider }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  
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
    onLogout();
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
          {sidebarOpen ? '✕' : '☰'}
        </button>
        
        {/* Page title */}
        <h1 className="page-title">{pageTitle}</h1>
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
                  window.location.href = '/dashboard/profile';
                }}
              >
                <span className="item-icon">👤</span>
                <span className="item-text">{t('Profile')}</span>
              </button>
              
              <button 
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  window.location.href = '/dashboard/settings';
                }}
              >
                <span className="item-icon">⚙️</span>
                <span className="item-text">{t('Settings')}</span>
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <span className="item-icon">🚪</span>
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