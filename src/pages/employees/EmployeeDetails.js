import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './EmployeeDetails.module.css';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  GraduationCap, 
  Scale, 
  ChevronRight, 
  AlertCircle,
  User
} from 'lucide-react';

const EmployeeDetails = ({ userInfo }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [apprenticeCount, setApprenticeCount] = useState(0);
  const [attorneyCount, setAttorneyCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ensure we have a lawyer ID
  const lawyerId = userInfo?.lawyer_id || localStorage.getItem('lawyerId');

  // Fetch counts for apprentices and attorneys based on employee type
  useEffect(() => {
    const fetchCounts = async () => {
      if (!lawyerId) {
        setError(t('no_lawyer_id'));
        setLoading(false);
        return;
      }

      try {
        // Fetch count of apprentices
        const { count: apprenticeCount, error: apprenticeError } = await supabase
          .from('apprentice')
          .select('*', { count: 'exact' });

        if (apprenticeError) throw apprenticeError;

        // Fetch count of attorneys
        const { count: attorneyCount, error: attorneyError } = await supabase
          .from('attorney_at_law')
          .select('*', { count: 'exact' });

        if (attorneyError) throw attorneyError;

        // Set counts in state
        setApprenticeCount(apprenticeCount || 0);
        setAttorneyCount(attorneyCount || 0);
        setTotalEmployees((apprenticeCount || 0) + (attorneyCount || 0));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [lawyerId, t]);

  // If no lawyer ID is found, show an error message
  if (!lawyerId) {
    return (
      <div className={styles.employeeDetailsContainer}>
        <div className={styles.errorNotification}>
          <AlertCircle size={20} />
          <span>{t('no_lawyer_id_found')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.employeeDetailsContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>
          <Users className={styles.headerIcon} />
          {t('employee_details')}
        </h1>
      </div>

      {/* Error Handling */}
      {error && (
        <div className={styles.errorNotification}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingIndicator}>
          <div className={styles.loadingSpinner}></div>
          <span>{t('loading')}</span>
        </div>
      ) : (
        <>
          {/* Total Employees Overview Card */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryIconWrapper}>
              <Users size={24} className={styles.summaryIcon} />
            </div>
            <div className={styles.summaryContent}>
              <h3 className={styles.summaryTitle}>{t('total_employees')}</h3>
              <div className={styles.summaryValue}>{totalEmployees}</div>
            </div>
          </div>

          {/* Employee Category Cards */}
          <div className={styles.cardsGrid}>
            {/* Apprentice Card */}
            <div 
              className={`${styles.employeeCard} ${styles.apprenticeCard}`}
              onClick={() => navigate('/dashboard/apprentice-details')}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrapper}>
                  <GraduationCap size={24} className={styles.cardIcon} />
                </div>
                <h3 className={styles.cardTitle}>{t('apprentice_details')}</h3>
              </div>
              
              <div className={styles.cardBody}>
                <p className={styles.cardDescription}>{t('apprentice_details_description')}</p>
                <div className={styles.statsRow}>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>{t('total_apprentices')}</span>
                    <span className={styles.statValue}>{apprenticeCount}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <button className={styles.viewDetailsButton}>
                  <span>{t('view_details')}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Attorney Card */}
            <div 
              className={`${styles.employeeCard} ${styles.attorneyCard}`}
              onClick={() => navigate('/dashboard/attorney-details')}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrapper}>
                  <Scale size={24} className={styles.cardIcon} />
                </div>
                <h3 className={styles.cardTitle}>{t('attorney_details')}</h3>
              </div>
              
              <div className={styles.cardBody}>
                <p className={styles.cardDescription}>{t('attorney_details_description')}</p>
                <div className={styles.statsRow}>
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>{t('total_attorneys')}</span>
                    <span className={styles.statValue}>{attorneyCount}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <button className={styles.viewDetailsButton}>
                  <span>{t('view_details')}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeDetails;