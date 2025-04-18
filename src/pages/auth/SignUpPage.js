import React, { useState } from "react"; // Importing the react useState hook to manage state in the component
import { Link, useNavigate } from "react-router-dom"; // Importing Link and useNavigate from react-router-dom for navigation
import { supabase } from "../../supabaseClient"; // Importing the supabase client to interact with the Supabase backend
import { useTranslation } from "react-i18next"; // Importing the useTranslation hook from react-i18next for internationalization
import "./AuthPages.css"; // Importing CSS styles for the authentication pages

const SignUpPage = () => {
  // useState is a used to manage the state  formData of the component
  // formData is an object that holds the values  - email, username, password, name, contactNo, languageCompetency, and yearsOfExperience
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    name: "",
    contactNo: "",
    languageCompetency: [],
    yearsOfExperience: "",
  });
  const [error, setError] = useState(""); // State to hold error messages
  const [success, setSuccess] = useState(""); // State to hold success messages
  const [loading, setLoading] = useState(false); // State to manage loading state during sign-up process
  const navigate = useNavigate(); // useNavigate is a hook that returns a function that lets you navigate programmatically
  const { t } = useTranslation(); // useTranslation is a hook that returns the t function for translation

  const languages = ["Tamil", "English", "Sinhala"];
  // The languages array contains the languages that the user can select for language competency

  const handleChange = (e) => {
    const { name, value } = e.target; // Destructuring the name and value from the event target
    // The name is the name of the input field and value is the value entered by the user
    setFormData({
      ...formData,
      // Spread operator is used to copy the existing properties of formData
      [name]: value,
    });
  };

  const handleLanguageChange = (e) => {
    // This function handles the change event for the language competency checkboxes
    const { value } = e.target;
    // The value is the language selected by the user
    setFormData({
      ...formData,
      languageCompetency: formData.languageCompetency.includes(value)
        ? formData.languageCompetency.filter((lang) => lang !== value)
        : [...formData.languageCompetency, value],
      // The spread operator is used to copy the existing properties of formData
      // If the language is already selected, it is removed from the array, otherwise it is added to the array
    });
  };

  const validateForm = () => {
    // Password validation
    if (formData.password.length < 6) {
      setError(
        t("password_too_short") || "Password should be at least 6 characters"
      );
      return false;
    }
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(""); // Clear any previous error messages
    setSuccess(""); // Clear any previous success messages
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    setLoading(true); // Set loading state to true to indicate that the sign-up process is in progress
    try {
      //  Sign up user with Supabase Auth first
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            },
          },
        }
      );

      if (signUpError) throw signUpError;
      // Verify the user was created successfully
      if (!authData.user) {
        throw new Error(t("user_creation_failed"));
      }

      //  First create the attorney record to get the lawyer_id
      // Convert language array to comma-separated string
      const languageString = formData.languageCompetency.join(", ");

      // Insert the attorney details into the attorney_at_law table if Successfully signed up
      const { data: attorneyData, error: attorneyError } = await supabase
        .from("attorney_at_law")
        .insert([
          {
            email: formData.email,
            name: formData.name,
            contact_no: formData.contactNo,
            language_competency: languageString,
            years_of_experience: formData.yearsOfExperience,
          },
        ])
        .select();
      if (attorneyError) throw attorneyError;

      // Get the newly created attorney's ID
      const attorneyId = attorneyData[0].lawyer_id;

      //  Now insert user details into users table with the lawyer_id
      const { error: userInsertError } = await supabase.from("users").insert([
        {
          email: formData.email,
          username: formData.username,
          lawyer_id: attorneyId,
        },
      ]);

      if (userInsertError) throw userInsertError;
      // If everything is successful, show success message and redirect to sign-in page
      setSuccess(t("signup_successful"));
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (err) {
      // Handle any errors that occur during the sign-up process
      console.error("Signup Error:", err);
      // Set the error message to be displayed to the user
      setError(err.message || t("signup_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container signup-container">
        <div className="auth-form-container">
          <h1>{t("signup")}</h1>

          <form className="auth-form" onSubmit={handleSignUp}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">{t("Name")}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="auth-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t("Email")}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email} // email input field
                  onChange={handleChange}// onChange event handler to update formData state
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">{t("username")}</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username} // username input field
                  onChange={handleChange} // onChange event handler to update formData state
                  className="auth-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t("password")}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password} // password input field
                  onChange={handleChange} // onChange event handler to update formData state
                  className="auth-input"
                  required
                  minLength="6"
                />
                <small className="form-hint">
                  {t("Password_must_be_at_least_6_characters")}
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactNo">{t("ContactNo")}</label>
                <input
                  type="text"
                  id="contactNo"
                  name="contactNo"
                  value={formData.contactNo} // contact number input field
                  onChange={handleChange} // onChange event handler to update formData state
                  className="auth-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="yearsOfExperience">
                  {t("Years_Of_Experience")}
                </label>
                <input
                  type="text"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience} // years of experience input field
                  onChange={handleChange} // onChange event handler to update formData state
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t("Language_Competency")}</label>
              <div className="language-checkboxes">
                {languages.map((language) => (
                  <div key={language} className="checkbox-group">
                    <input
                      type="checkbox"
                      id={language}
                      value={language} // language competency checkbox
                      checked={formData.languageCompetency.includes(language)} // get the checked status of the checkbox
                      onChange={handleLanguageChange} // onChange event handler to update formData state
                    />
                    <label htmlFor={language}>{language}</label>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? t("creating_account") : t("signup")}
              </button>
            </div>

            <div className="auth-links">
              <p className="signin-prompt">
                {t("already_have_account")}{" "}
                <Link to="/signin" className="signin-link">
                  {t("signin")}
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

export default SignUpPage;
