import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useTranslation } from "react-i18next";
import "./AuthPages.css";

const SignInPage = ({ onLogin }) => {
  // Only ONE SignInPage
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAfterLogin = async (user) => {
    try {
      const { data: attorneyData, error: fetchError } = await supabase
        .from("attorney_at_law")
        .select("lawyer_id")
        .eq("email", user.email)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (!attorneyData) {
        const { user_metadata } = user;

        const { data: newAttorney, error: createError } = await supabase
          .from("attorney_at_law")
          .insert([
            {
              email: user.email,
              name: user_metadata.name,
              contact_no: user_metadata.contact_no,
              language_competency: user_metadata.language_competency,
              years_of_experience: user_metadata.years_of_experience,
            },
          ])
          .select();

        if (createError) throw createError;

        const attorneyId = newAttorney[0].lawyer_id;

        const { error: userInsertError } = await supabase.from("users").insert([
          {
            email: user.email,
            username: user_metadata.username,
            lawyer_id: attorneyId,
          },
        ]);

        if (userInsertError) throw userInsertError;
      }
    } catch (error) {
      console.error("Attorney creation after login failed:", error);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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

      if (data?.user) {
        await handleAfterLogin(data.user);
      }

      const { data: userData, error: fetchUserError } = await supabase
        .from("users")
        .select("lawyer_id, username")
        .eq("email", formData.email)
        .single();

      if (fetchUserError) {
        setError(fetchUserError.message);
        setLoading(false);
        return;
      }

      if (userData) {
        const username = userData.username;
        const lawyerId = userData.lawyer_id;
        localStorage.setItem("lawyerId", lawyerId);
        localStorage.setItem("username", username);
        onLogin();
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || t("login_error"));
    } finally {
      setLoading(false);
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
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
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
