import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './ClientSeeView.module.css'; // Updated to use CSS modules
import { useTranslation } from 'react-i18next';

const ClientSeeView = () => {
    const { t } = useTranslation();
    const { clientId, caseId } = useParams(); // Get clientId and caseId from URL parameters
    const [caseDetails, setCaseDetails] = useState(null);
    const [lawyerData, setLawyerData] = useState(null);
    const [caseTypeData, setCaseTypeData] = useState(null); // State for case type
    const [updates, setUpdates] = useState([]);
    const [clientData, setClientData] = useState(null); // State for clicked client details
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('status'); // 'status' or 'tasks'

    useEffect(() => {
        const fetchCaseDetails = async () => {
            try {
                setLoading(true);
                // Fetch case details directly using the caseId parameter
                const { data: casesData, error: casesError } = await supabase
                    .from('cases')
                    .select('case_id, case_no, case_type_id, opened_date, lawyer_id')
                    .eq('case_id', caseId) // Use the caseId from URL parameters
                    .single();

                if (casesError) throw new Error(casesError.message);

                if (casesData) {
                    setCaseDetails(casesData); // Set the case details

                    // Fetch lawyer details based on lawyer_id
                    if (casesData.lawyer_id) {
                        const { data: lawyerDetail, error: lawyerError } = await supabase
                            .from('attorney_at_law')
                            .select('*')
                            .eq('lawyer_id', casesData.lawyer_id)
                            .single();

                        if (lawyerError) throw new Error(lawyerError.message);
                        setLawyerData(lawyerDetail);
                    }

                    // Fetch updates for this specific case using the correct case_id
                    if (casesData.case_id) { // Check if case_id is defined
                        const { data: updateData, error: updateError } = await supabase
                            .from('case_updates')
                            .select('*')
                            .eq('case_id', casesData.case_id); // Use the current case_id

                        if (updateError) throw new Error(updateError.message);
                        setUpdates(updateData); // Set updates state with fetched data
                    }

                    // Fetch the corresponding case type using the case_type_id
                    if (casesData.case_type_id) {
                        const { data: caseTypeDetail, error: caseTypeError } = await supabase
                            .from('case_types')
                            .select('*')
                            .eq('id', casesData.case_type_id)
                            .single();

                        if (caseTypeError) throw new Error(caseTypeError.message);
                        setCaseTypeData(caseTypeDetail); // Set fetched case type data
                    }
                } else {
                    throw new Error("No cases found for this client.");
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        const fetchClientDetails = async () => {
            try {
                // Fetch clicked client details based on clientId
                const { data: clientDetail, error: clientError } = await supabase
                    .from('clients') // Assuming 'clients' is your table name
                    .select('*')
                    .eq('client_id', clientId)
                    .single();

                if (clientError) throw new Error(clientError.message);
                setClientData(clientDetail); // Set clicked client details in state

            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        const fetchTasks = async () => {
            try {
                // First fetch client_case_id using both clientId and caseId
                const { data: clientCaseEntry, error: clientCaseError } = await supabase
                    .from('client_case')
                    .select('client_case_id')
                    .eq('client_id', clientId)
                    .eq('case_id', caseId)
                    .single(); // Get the specific entry

                if (clientCaseError) throw new Error(clientCaseError.message);

                if (clientCaseEntry) {
                    const clientCaseId = clientCaseEntry.client_case_id; // Get the client_case_id

                    // Now fetch tasks associated with this specific client_case_id.
                    const { data: tasksData, error } = await supabase
                        .from('client_case_task')
                        .select('*')
                        .eq('client_case_id', clientCaseId); // Use the fetched client_case_id

                    if (error) throw new Error(error.message);

                    setTasks(tasksData); // Update state with fetched tasks
                }
            } catch (err) {
                console.error(err);
                alert(`Failed to fetch tasks: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchCaseDetails(); // Fetch case details when component mounts
        fetchClientDetails(); // Fetch clicked client details when component mounts
        fetchTasks(); // Fetch tasks when component mounts

    }, [clientId, caseId]); // Added both clientId and caseId to dependencies

    // Function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className={styles.clientViewContainer}>
            {error && <div className={styles.errorAlert}>{error}</div>}
            
            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>{t('Loading')}</p>
                </div>
            ) : (
                <>
                    <div className={styles.infoSection}>
                        {/* Client Details Card */}
                        {clientData && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>{t('ClientDetails')}</h2>
                                <div className={styles.cardContent}>
                                    <div className={styles.clientAvatar}>
                                        {clientData.name ? clientData.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className={styles.clientInfo}>
                                        <p className={styles.clientName}>{clientData.name}</p>
                                        <p className={styles.clientDetail}>
                                            <span className={styles.label}>{t('ContactNo')}:</span> {clientData.contact_no}
                                        </p>
                                        <p className={styles.clientDetail}>
                                            <span className={styles.label}>{t('Email')}:</span> {clientData.email}
                                        </p>
                                        {clientData.profession && (
                                            <p className={styles.clientDetail}>
                                                <span className={styles.label}>{t('Profession')}:</span> {clientData.profession}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Case Details Card */}
                        {caseDetails && (
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>
                                    {t('CaseNo')} {caseDetails.case_no}
                                </h2>
                                <div className={styles.cardContent}>
                                    <div className={styles.caseInfo}>
                                        <p className={styles.caseDetail}>
                                            <span className={styles.label}>{t('CaseType')}:</span> 
                                            {caseTypeData ? caseTypeData.case_type : 'Loading...'}
                                        </p>
                                        <p className={styles.caseDetail}>
                                            <span className={styles.label}>{t('OpenedDate')}:</span> 
                                            {formatDate(caseDetails.opened_date)}
                                        </p>
                                    </div>
                                </div>

                                {/* Lawyer Details */}
                                {lawyerData && (
                                    <div className={styles.lawyerSection}>
                                        <h3 className={styles.sectionTitle}>{t('AttorneyDetails')}</h3>
                                        <div className={styles.lawyerInfo}>
                                            <div className={styles.lawyerAvatar}>
                                                {lawyerData.name ? lawyerData.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p className={styles.lawyerName}>{lawyerData.name}</p>
                                                <p className={styles.lawyerDetail}>
                                                    <span className={styles.label}>{t('Contact_No')}:</span> {lawyerData.contact_no}
                                                </p>
                                                <p className={styles.lawyerDetail}>
                                                    <span className={styles.label}>{t('Email')}:</span> {lawyerData.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabs for Status Quo and Tasks */}
                    <div className={styles.tabsContainer}>
                        <div className={styles.tabsHeader}>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'status' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('status')}
                            >
                                {t('StatusQuo')}
                            </button>
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'tasks' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('tasks')}
                            >
                                {t('Tasks/steps')}
                            </button>
                        </div>
                        
                        <div className={styles.tabContent}>
                            {/* Status Quo Tab Content */}
                            {activeTab === 'status' && (
                                <div className={styles.statusContent}>
                                    {updates.length > 0 ? (
                                        <div className={styles.tableContainer}>
                                            <table className={styles.statusTable}>
                                                <thead>
                                                    <tr>
                                                        <th>{t('PreviousDate')}</th>
                                                        <th>{t('Description')}</th>
                                                        <th>{t('NextStep')}</th>
                                                        <th>{t('NextDate')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {updates.map((update) => (
                                                        <tr key={update.case_update_id}>
                                                            <td>{formatDate(update.previous_date)}</td>
                                                            <td className={styles.descriptionCell}>{update.description}</td>
                                                            <td>{update.next_step}</td>
                                                            <td>{formatDate(update.next_date)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className={styles.emptyState}>
                                            <p>{t('NoUpdatesFound')}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Tasks Tab Content */}
                            {activeTab === 'tasks' && (
                                <div className={styles.tasksContent}>
                                    {tasks.length > 0 ? (
                                        <div className={styles.tasksGrid}>
                                            {tasks.map(task => (
                                                <div key={task.client_case_task_id} className={styles.taskCard}>
                                                    <h4 className={styles.taskName}>{task.client_case_task}</h4>
                                                    <p className={styles.taskDeadline}>
                                                        <span className={styles.label}>{t('Deadline')}:</span> 
                                                        {formatDate(task.deadline)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={styles.emptyState}>
                                            <p>{t('NoTasksFound')}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientSeeView;