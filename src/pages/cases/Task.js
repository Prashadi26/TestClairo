import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Task.module.css'; // New CSS module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardList, 
  faCalendarAlt, 
  faCalendarCheck, 
  faGavel, 
  faBriefcase,
  faArrowLeft, 
  faPlus, 
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const TaskForm = () => {
  const { t } = useTranslation();
  const { caseId } = useParams();
  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('started');
  const [lawyerId, setLawyerId] = useState('');
  const [lawyerName, setLawyerName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Extract lawyerId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const extractedLawyerId = queryParams.get('lawyerId');

  // Fetch case details and lawyer name when the component mounts
  useEffect(() => {
    const fetchCaseAndLawyerDetails = async () => {
      try {
        setLoading(true);
        // Fetching case details using caseId
        const { data: caseData, error: caseError } = await supabase
          .from('cases')
          .select('*')
          .eq('case_id', caseId)
          .single();

        if (caseError) throw new Error(caseError.message);
        setCaseDetails(caseData);

        // Fetching lawyer details using extractedLawyerId
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

    fetchCaseAndLawyerDetails();
  }, [caseId, extractedLawyerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs before sending
      if (!taskName || !caseId) {
        throw new Error('All fields are required.');
      }

      // Insert data into Supabase for tasks including case_id
      const { error: taskError } = await supabase.from('tasks').insert([
        {
          task_name: taskName,
          start_date: startDate,
          end_date: endDate,
          status,
          case_id: caseId,
        },
      ]);

      if (taskError) {
        throw new Error(`Failed to save task: ${taskError.message}`);
      }

      setSuccess('Task added successfully!');
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate(`/dashboard/case-details/${caseId}`);
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  // Resetting form fields
  const resetForm = () => {
    setTaskName('');
    setStartDate('');
    setEndDate('');
    setStatus('started');
  };

  // Function to go back
  const handleBack = () => {
    navigate(`/dashboard/case-details/${caseId}`);
  };

  // Get status icon based on current status
  const getStatusIcon = (statusValue) => {
    switch(statusValue) {
      case 'completed':
        return faCheck;
      case 'in-progress':
      case 'started':
        return faClipboardList;
      default:
        return faClipboardList;
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <button 
          className={styles.backButton} 
          onClick={handleBack}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className={styles.pageTitle}>{t('AddTask')}</h2>
      </div>

      {error && (
        <div className={styles.errorNotification}>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className={styles.successNotification}>
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t('Loading')}</p>
        </div>
      ) : (
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formContent}>
              {/* Displaying Case Number as Non-Editable Field */}
              {caseDetails && (
                <div className={styles.formGroup}>
                  <label htmlFor="caseNo">
                    <FontAwesomeIcon icon={faBriefcase} className={styles.inputIcon} />
                    {t('CaseNo')}
                  </label>
                  <input 
                    type="text" 
                    id="caseNo"
                    value={caseDetails.case_no} 
                    readOnly 
                    className={`${styles.textInput} ${styles.readOnlyInput}`}
                  />
                </div>
              )}

              {/* Lawyer Name Display */}
              <div className={styles.formGroup}>
                <label htmlFor="lawyerName">
                  <FontAwesomeIcon icon={faGavel} className={styles.inputIcon} />
                  {t('Lawyer')}
                </label>
                <input 
                  type="text" 
                  id="lawyerName"
                  value={lawyerName} 
                  readOnly 
                  className={`${styles.textInput} ${styles.readOnlyInput}`}
                />
              </div>

              {/* Step Field */}
              <div className={styles.formGroup}>
                <label htmlFor="taskName">
                  <FontAwesomeIcon icon={faClipboardList} className={styles.inputIcon} />
                  {t('StepName')}
                </label>
                <input 
                  type="text" 
                  id="taskName"
                  value={taskName} 
                  onChange={(e) => setTaskName(e.target.value)} 
                  required 
                  className={styles.textInput}
                  placeholder={t('EnterTaskName')}
                />
              </div>

              {/* Start Date Field */}
              <div className={styles.formGroup}>
                <label htmlFor="startDate">
                  <FontAwesomeIcon icon={faCalendarAlt} className={styles.inputIcon} />
                  {t('StartDate')}
                </label>
                <input 
                  type="date" 
                  id="startDate"
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className={styles.dateInput}
                />
              </div>

              {/* Deadline Field */}
              <div className={styles.formGroup}>
                <label htmlFor="endDate">
                  <FontAwesomeIcon icon={faCalendarCheck} className={styles.inputIcon} />
                  {t('Deadline')}
                </label>
                <input 
                  type="date" 
                  id="endDate"
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  required 
                  className={styles.dateInput}
                />
              </div>

              {/* Status Field */}
              <div className={styles.formGroup}>
                <label htmlFor="status">
                  <FontAwesomeIcon icon={getStatusIcon(status)} className={styles.inputIcon} />
                  {t('Status')}
                </label>
                <select 
                  id="status"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className={styles.selectInput}
                > 
                  <option value="started">{t('Started')}</option>
                  <option value="in-progress">{t('InProgress')}</option>
                  <option value="completed">{t('Completed')}</option>
                  <option value="on hold">{t('OnHold')}</option>
                  <option value="canceled">{t('Canceled')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.resetButton}
                onClick={resetForm}
              >
                {t('Reset')}
              </button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={handleBack}
              >
                {t('Cancel')}
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? t('Adding') : t('Add')}
                <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskForm;
