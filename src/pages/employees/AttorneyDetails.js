import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import styles from './AttorneyDetails.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faEdit, faUserTie, faSearch, faSort } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const AttorneyDetails = () => {
  const { t } = useTranslation();
  const [lawyers, setLawyers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch lawyers on component mount
  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      
      // Fetch all lawyers
      const { data, error } = await supabase
        .from('attorney_at_law')
        .select('*');

      if (error) {
        setError(error.message);
      } else {
        setLawyers(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lawyerId) => {
    if (window.confirm(t('confirm_delete_lawyer'))) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('attorney_at_law')
          .delete()
          .eq('lawyer_id', lawyerId);
          
        if (error) {
          setError(error.message);
        } else {
          fetchLawyers(); // Refresh the list after deletion
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateClick = (lawyerId) => {
    navigate(`/dashboard/attorney/update/${lawyerId}`);
  };

  // Filter lawyers based on search term
  const filteredLawyers = lawyers.filter(lawyer => 
    lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.language_competency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.lawyerDetailsContainer}>
      <div className={styles.header}>
        <h2>{t('Attorney_at_law_details')}</h2>
       
      </div>

      {/* Error Handling */}
      {error && (
        <div className={styles.alert}>
          <div className={styles.alertIcon}>!</div>
          <div className={styles.alertMessage}>{error}</div>
          <button className={styles.alertClose} onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className={styles.dashboardCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <FontAwesomeIcon icon={faUserTie} />
          </div>
          <div className={styles.cardContent}>
            <h3>{t('total_attorneys')}</h3>
            <div className={styles.count}>{lawyers.length}</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loaderRing}></div>
          <p>{t('loading')}</p>
        </div>
      ) : (
        <div className={styles.contentCard}>
          {/* Search and Filter Controls */}
          <div className={styles.tableControls}>
            <div className={styles.searchContainer}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t('Search attorneys...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Attorneys Table */}
          {filteredLawyers.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faUserTie} className={styles.emptyIcon} />
              <p>{searchTerm ? t('no_search_results') : t('no_attorneys_found')}</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.lawyersTable}>
                <thead>
                  <tr>
                    <th>
                      <div className={styles.thContent}>
                        {t('Name')}
                        <FontAwesomeIcon icon={faSort} className={styles.sortIcon} />
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        {t('Email')}
                        <FontAwesomeIcon icon={faSort} className={styles.sortIcon} />
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        {t('Contact_No')}
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        {t('Language_Competency')}
                      </div>
                    </th>
                    <th>
                      <div className={styles.thContent}>
                        {t('Years_Of_Experience')}
                        <FontAwesomeIcon icon={faSort} className={styles.sortIcon} />
                      </div>
                    </th>
                    <th>{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLawyers.map((lawyer) => (
                    <tr key={lawyer.lawyer_id}>
                      <td data-label={t('Name')}>{lawyer.name}</td>
                      <td data-label={t('Email')}>{lawyer.email}</td>
                      <td data-label={t('Contact_No')}>{lawyer.contact_no}</td>
                      <td data-label={t('Language_Competency')}>{lawyer.language_competency}</td>
                      <td data-label={t('Years_Of_Experience')}>{lawyer.years_of_experience}</td>
                      <td data-label={t('Actions')}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => handleUpdateClick(lawyer.lawyer_id)}
                            className={styles.editButton}
                            title={t('update_attorney')}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDelete(lawyer.lawyer_id)}
                            className={styles.deleteButton}
                            title={t('delete_attorney')}
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttorneyDetails;