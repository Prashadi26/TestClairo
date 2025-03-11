import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AttorneyUpdate.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const AttorneyUpdate = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [email, setEmail] = useState('');
  const [languageCompetency, setLanguageCompetency] = useState([]);
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const languages = ['Tamil', 'English', 'Sinhala'];
 
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract lawyerId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const lawyerId = queryParams.get('lawyerId');

  // Fetch lawyer details when component mounts
  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('attorney_at_law')
          .select('*')
          .eq('lawyer_id', lawyerId)
          .single();
          
        if (error) {
          throw new Error(error.message);
        }
        
        if (data) {
          setName(data.name);
          setContactNo(data.contact_no);
          setEmail(data.email);
          setLanguageCompetency(data.language_competency ? data.language_competency.split(', ') : []);
          setYearsOfExperience(data.years_of_experience || '');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyer();
  }, [lawyerId]);

  // Handle language checkbox changes
  const handleLanguageChange = (e) => {
    const { value } = e.target;
    setLanguageCompetency((prev) =>
      prev.includes(value)
        ? prev.filter((lang) => lang !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert array of languages to a comma-separated string for storage
      const languageString = languageCompetency.join(', ');

      // Update data in Supabase for lawyers
      const { error } = await supabase
        .from('attorney_at_law')
        .update({
          name,
          contact_no: contactNo,
          email,
          language_competency: languageString || null,
          years_of_experience: yearsOfExperience || null,
        })
        .eq('lawyer_id', lawyerId);

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(t('attorney_updated_successfully'));
      
      // Redirect back to Lawyer Details page after successful update
      navigate(`dashboard/attorney-details`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2>
          <FontAwesomeIcon icon={faUserTie} className={styles.headerIcon} />
          {t('UpdateAttorneyAtLaw')}
        </h2>
        <button 
          className={styles.backButton} 
          onClick={() => navigate(`dashboard/attorney-details`)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          {t('back_to_list')}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className={`${styles.notification} ${styles.errorNotification}`}>
          {error}
        </div>
      )}
      
      {success && (
        <div className={`${styles.notification} ${styles.successNotification}`}>
          {success}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t('loading')}</p>
        </div>
      ) : (
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>{t('Name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>{t('Contact_No')}</label>
              <input
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>{t('Email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>{t('Language_Competency')}</label>
              <div className={styles.checkboxGroup}>
                {languages.map((language) => (
                  <div key={language} className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id={language}
                      value={language}
                      checked={languageCompetency.includes(language)}
                      onChange={handleLanguageChange}
                      className={styles.checkbox}
                    />
                    <label htmlFor={language} className={styles.checkboxLabel}>
                      {language}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>{t('Years_Of_Experience')}</label>
              <input
                type="text"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => navigate(`dashboard/attorney-details`)}
              >
                {t('Cancel')}
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? t('updating') : t('Update')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AttorneyUpdate;