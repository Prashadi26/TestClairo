import React, { useState } from "react"; // Importing React and useState hook
import { Link, useNavigate } from "react-router-dom"; // Importing Link and useNavigate from react-router-dom
import { supabase } from "../../supabaseClient"; // Importing supabase client
import { useTranslation } from "react-i18next"; // Importing useTranslation hook for internationalization
import "./AuthPages.css"; // Importing CSS styles for authentication pages

const SignInPage = ({ onLogin }) => {
  const navigate = useNavigate(); // Hook to navigate
  const { t } = useTranslation(); // Hook for translation
  const [error, setError] = useState(""); // State for error messages
  const [loading, setLoading] = useState(false); //  State for loading status
  const [formData, setFormData] = useState({
    // State for form data with email and password fields
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update the formData state when input fields change
    setFormData({
      ...formData,
      [name]: value, // Dynamically update the field based on name
    });
  };

  const handleSignIn = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // setLoading(true);

    try {
      //Sign in the user
      // Call Supabase's signInWithPassword method to authenticate the user
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Retrieve user data including lawyer_id
      // Fetch user data from the "users" table using Supabase client
      const { data: userData, error: fetchUserError } = await supabase
        .from("users")
        .select("lawyer_id ,username")
        .eq("email", formData.email)
        .single(); // Fetching only one record

      if (fetchUserError) {
        // Handle error if fetching user data fails
        setError(fetchUserError.message);
        // setLoading to false to stop loading state
        setLoading(false);
        return;
      }

      //  Redirect to dashboard with lawyer ID
      // If user data is successfully retrieved,
      // store lawyer ID and username in local storage and navigate to the dashboard
      // so we can take the user to the dashboard page
      if (userData) {
        const username = userData.username;
        const lawyerId = userData.lawyer_id;
        localStorage.setItem("lawyerId", lawyerId);
        localStorage.setItem("username", username);
        // Call the onLogin function from props
        onLogin();

        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || t("login_error")); // Handle any unexpected errors
    } finally {
      setLoading(false); // Stop loading state once all finish 
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container">
          <h1>{t("signin")}</h1>

          <form className="auth-form" onSubmit={handleSignIn}>
            <div className="form-group">
              <label htmlFor="email">{t("email")}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email} // Binding email input to formData state
                onChange={handleChange} // Updating state on input change
                className="auth-input"
                placeholder="abc@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t("password")}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password} // Binding password input to formData state
                onChange={handleChange} // Updating state on input change
                className="auth-input"
                placeholder="xxxxxx"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? t("signing_in") : t("signin")}
              </button>
            </div>

            <div className="auth-links">
              <Link to="/reset-password" className="forgot-password">
                {t("forgot_password")}
              </Link>

              <p className="signup-prompt">
                {t("dont_have_account")}
                <Link to="/signup" className="signup-link">
                  {t("signup")}
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="auth-image">
          <div className="auth-quote">
            <h2>Clairo</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
