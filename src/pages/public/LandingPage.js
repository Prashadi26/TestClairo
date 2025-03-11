import React from 'react';
import { Link } from 'react-router-dom';
import './PublicPages.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Our Dashboard</h1>
            <p>
              A powerful and intuitive dashboard to manage all your business needs.
              Sign in to access your personalized dashboard or sign up to get started.
            </p>
            <div className="hero-buttons">
              <Link to="/signin" className="btn btn-primary">Sign In</Link>
              <Link to="/signup" className="btn btn-outline">Sign Up</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              Dashboard Preview
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics</h3>
              <p>Comprehensive analytics and reporting to track your business performance.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>User Management</h3>
              <p>Easily manage users, roles, and permissions within your organization.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Customization</h3>
              <p>Personalize your dashboard to focus on what matters most to you.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="cta">
        <div className="container">
          <h2>Ready to get started?</h2>
          <p>Sign up today and experience the power of our dashboard.</p>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;