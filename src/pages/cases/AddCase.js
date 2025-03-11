import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaGavel, FaArrowLeft, FaCalendarAlt, FaBuilding, FaClipboardList } from 'react-icons/fa';
import styles from './AddCase.module.css'; // Update to use CSS modules

const AddCase = () => {
  const { t } = useTranslation();
  // Keep original state structure
  const [caseNo, setCaseNo] = useState('');
  const [openedDate, setOpenedDate] = useState('');
  const [court, setCourt] = useState('');
  const [caseTypeId, setCaseTypeId] = useState('');
  const [lawyers, setLawyers] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [lawyerId, setLawyerId] = useState('');
  const [lawyerName, setLawyerName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract lawyerId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const extractedLawyerId = queryParams.get('lawyerId');

  // Fetch lawyers and case types - retain original data fetch logic
  useEffect(() => {
    const fetchLawyersAndCaseTypes = async () => {
      try {
        setLoading(false);
        // Fetch case types
        const { data: caseTypeData, error: caseTypeError } = await supabase
          .from('case_types')
          .select('id, case_type');

        if (caseTypeError) throw new Error(caseTypeError.message);
        setCaseTypes(caseTypeData);

        // Fetch lawyer details using the extracted lawyerId
        if (extractedLawyerId) {
          const { data: lawyerData, error: lawyerError } = await supabase
            .from('attorney_at_law')
            .select('lawyer_id, name')
            .eq('lawyer_id', extractedLawyerId)
            .single();

          if (lawyerError) throw new Error(lawyerError.message);
          if (lawyerData) {
            setLawyerId(lawyerData.lawyer_id);
            setLawyerName(lawyerData.name);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyersAndCaseTypes();
  }, [extractedLawyerId]);

  // Go back to case board
  const handleBack = () => {
    navigate('/dashboard/case-boards'); // Maintain original navigation path
  };

  // Keep original handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs before sending
      if (!caseNo || !openedDate || !caseTypeId) {
        throw new Error('All fields are required.');
      }

      // Insert data into Supabase for cases including case_type_id
      const { error: caseError } = await supabase.from('cases').insert([
        {
          case_no: caseNo,
          opened_date: openedDate,
          court: court,
          case_type_id: caseTypeId,
        },
      ]);

      if (caseError) {
        console.error('Error details:', caseError);
        throw new Error(`Failed to save case: ${caseError.message}`);
      }

      setSuccess('Case added successfully!');
      resetForm(); // Reset form fields
      
      // Redirect back to CaseBoard after successful addition
      navigate(`/dashboard/case-boards`); // Keep original redirect path

    } catch (err) {
      console.error(err);
      setError(err.message);
      setSuccess(null);
    }
  };

  // Keep original resetForm function
  const resetForm = () => {
    setCaseNo('');
    setOpenedDate('');
    setCourt('');
    setCaseTypeId('');
    setLawyerName('');
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <button 
          className={styles.backButton} 
          onClick={handleBack}
          aria-label={t('Back')}
        >
          <FaArrowLeft />
        </button>
        <h2><FaGavel className={styles.headerIcon} /> {t('AddCaseDetails', 'Add Case Details')}</h2>
      </div>

      {/* Notification area */}
      {error && (
        <div className={`${styles.notification} ${styles.errorNotification}`}>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className={`${styles.notification} ${styles.successNotification}`}>
          <span>{success}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t('loading', 'Loading...')}</p>
        </div>
      ) : (
        <div className={styles.cardContainer}>
          <form onSubmit={handleSubmit} className={styles.formCard}>
            {/* Case Number Field */}
            <div className={styles.formGroup}>
              <label htmlFor="caseNo">
                <FaClipboardList className={styles.inputIcon} /> {t('CaseNo', 'Case Number')}
              </label>
              <input 
                type="text" 
                id="caseNo"
                value={caseNo} 
                onChange={(e) => setCaseNo(e.target.value)} 
                placeholder={t('EnterCaseNumber', 'Enter case number')}
                required 
              />
            </div>

            {/* Case Type Field */}
            <div className={styles.formGroup}>
              <label htmlFor="caseTypeId">
                <FaGavel className={styles.inputIcon} /> {t('CaseType', 'Case Type')}
              </label>
              <select 
                id="caseTypeId"
                value={caseTypeId} 
                onChange={(e) => setCaseTypeId(e.target.value)}
                required
                className={styles.selectInput}
              >
                <option value="">{t('SelectCaseType', 'Select Case Type')}</option>
                {caseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.case_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Opened Date Field */}
            <div className={styles.formGroup}>
              <label htmlFor="openedDate">
                <FaCalendarAlt className={styles.inputIcon} /> {t('OpenedDate', 'Opened Date')}
              </label>
              <input 
                type="date" 
                id="openedDate"
                value={openedDate} 
                onChange={(e) => setOpenedDate(e.target.value)}
                required 
              />
            </div>

            {/* Court Field */}
            <div className={styles.formGroup}>
              <label htmlFor="court">
                <FaBuilding className={styles.inputIcon} /> {t('Court', 'Court')}
              </label>
              <input 
                type="text" 
                id="court"
                value={court} 
                onChange={(e) => setCourt(e.target.value)}
                placeholder={t('EnterCourt', 'Enter court name')}
                required 
              />
            </div>

            {/* Lawyer information display (read-only) */}
            {lawyerName && (
              <div className={styles.lawyerInfo}>
                <FaGavel className={styles.lawyerIcon} />
                <span>{t('AssignedLawyer', 'Assigned Lawyer')}: <strong>{lawyerName}</strong></span>
              </div>
            )}

            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.secondaryButton}
                onClick={resetForm}
              >
                {t('Reset', 'Reset')}
              </button>
              <button 
                type="submit" 
                className={styles.primaryButton}
              >
                {t('Add', 'Add Case')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddCase;