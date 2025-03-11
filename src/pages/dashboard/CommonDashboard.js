import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { supabase } from '../../supabaseClient';
import styles from './CommonDashboard.module.css';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart4,
  Users,
  Briefcase,
  AlertCircle,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  PauseCircle,
  TimerIcon
} from 'lucide-react';

// Register required components for Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CommonDashboard = ({ userInfo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [counts, setCounts] = useState({ employees: 0, clients: 0, cases: 0 });
  const [caseStatusCounts, setCaseStatusCounts] = useState({ in_progress: 0, on_hold: 0, completed: 0 });
  const [caseDetails, setCaseDetails] = useState({ in_progress: [], on_hold: [], completed: [] });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [showCaseDetails, setShowCaseDetails] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract lawyerId from query parameters or fallback to localStorage
  const queryParams = new URLSearchParams(location.search);
  let lawyerId = queryParams.get('lawyerId') || localStorage.getItem('lawyerId');

  const toggleCaseDetails = () => {
    setShowCaseDetails(!showCaseDetails);
  };

  // Fetch counts for employees, clients, and cases
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { count: apprenticeCount } = await supabase
          .from('apprentice')
          .select('*', { count: 'exact' });

        const { count: attorneyCount } = await supabase
          .from('attorney_at_law')
          .select('*', { count: 'exact' });

        const { count: clientCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact' });

        const { count: caseCount } = await supabase
          .from('cases')
          .select('*', { count: 'exact' });

        setCounts({
          employees: (apprenticeCount || 0) + (attorneyCount || 0),
          clients: clientCount || 0,
          cases: caseCount || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Fetch case status counts
  useEffect(() => {
    const fetchCaseStatusCounts = async () => {
      try {
        const { data } = await supabase.from('cases').select('current_status, case_no, case_id');

        if (data) {
          const statusCounts = { in_progress: 0, on_hold: 0, completed: 0 };
          const details = { in_progress: [], on_hold: [], completed: [] };

          data.forEach((item) => {
            if (item.current_status === 'in_progress') {
              statusCounts.in_progress += 1;
              details.in_progress.push({
                case_no: item.case_no,
                case_id: item.case_id
              });
            } else if (item.current_status === 'on_hold') {
              statusCounts.on_hold += 1;
              details.on_hold.push({
                case_no: item.case_no,
                case_id: item.case_id
              });
            } else if (item.current_status === 'completed') {
              statusCounts.completed += 1;
              details.completed.push({
                case_no: item.case_no,
                case_id: item.case_id
              });
            }
          });

          setCaseStatusCounts(statusCounts);
          setCaseDetails(details);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStatusCounts();
  }, []);

  // Fetch upcoming tasks within the next week
  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const { data } = await supabase
          .from('tasks')
          .select(`
            task_name,
            end_date,
            case_id,
            cases (case_no)
          `)
          .gte('end_date', today.toISOString())
          .lte('end_date', nextWeek.toISOString());

        setUpcomingTasks(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingTasks();
  }, []);

  // Fetch upcoming hearings within the next month
  useEffect(() => {
    const fetchUpcomingHearings = async () => {
      try {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        const { data } = await supabase
          .from('case_updates')
          .select(`
            next_date,
            case_id,
            cases (case_no, court)
          `)
          .gte('next_date', today.toISOString())
          .lte('next_date', nextMonth.toISOString());

        setUpcomingHearings(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingHearings();
  }, []);

  // Prepare data for the chart
  const chartData = {
    labels: ['In-Progress', 'On Hold', 'Completed'],
    datasets: [
      {
        label: t('Cases'),
        data: [caseStatusCounts.in_progress, caseStatusCounts.on_hold, caseStatusCounts.completed],
        backgroundColor: ['#4361ee', '#ff9f1c', '#2ec4b6'],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Helper function to format dates consistently
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>{t('dashboard')}</h1>
      </div>

      {/* Error Notification */}
      {error && (
        <div className={styles.errorNotification}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <div className={styles.loadingIndicator}>
          <div className={styles.loadingSpinner}></div>
          <span>{t('Loading...')}</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className={styles.summaryCardsGrid}>
            <div 
              className={`${styles.summaryCard} ${styles.employeesCard}`} 
              onClick={() => navigate(`/dashboard/employee-details`)}
            >
              <div className={styles.cardIconWrapper}>
                <Users size={24} className={styles.cardIcon} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{t('Employees')}</h3>
                <p className={styles.cardValue}>{counts.employees}</p>
                <p className={styles.cardLabel}>{t('Total_Employees')}</p>
              </div>
              <div className={styles.cardAction}>
                <ChevronRight size={20} />
              </div>
            </div>
            
            <div 
              className={`${styles.summaryCard} ${styles.clientsCard}`} 
              onClick={() => navigate(`/dashboard/clients`)}
            >
              <div className={styles.cardIconWrapper}>
                <Users size={24} className={styles.cardIcon} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{t('Clients')}</h3>
                <p className={styles.cardValue}>{counts.clients}</p>
                <p className={styles.cardLabel}>{t('Total_Clients')}</p>
              </div>
              <div className={styles.cardAction}>
                <ChevronRight size={20} />
              </div>
            </div>
            
            <div 
              className={`${styles.summaryCard} ${styles.casesCard}`} 
              onClick={() => navigate(`/dashboard/case-boards`)}
            >
              <div className={styles.cardIconWrapper}>
                <Briefcase size={24} className={styles.cardIcon} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{t('Cases')}</h3>
                <p className={styles.cardValue}>{counts.cases}</p>
                <p className={styles.cardLabel}>{t('Total_Cases')}</p>
              </div>
              <div className={styles.cardAction}>
                <ChevronRight size={20} />
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className={styles.dashboardGrid}>
                        {/* Upcoming Tasks Card */}
                        <div className={styles.tasksCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardHeaderTitle}>
                  <Clock size={20} />
                  <span>Upcoming Tasks</span>
                </h2>
              </div>
              
              <div className={styles.tasksContent}>
                {upcomingTasks.length > 0 ? (
                  <div className={styles.tasksList}>
                    {upcomingTasks.map((task, index) => (
                      <div className={styles.taskItem} key={`${task.case_id}-${index}`}>
                        <div className={styles.taskDetails}>
                          <h3 className={styles.taskName}>{task.task_name}</h3>
                          <div className={styles.taskMeta}>
                            <span className={styles.taskDeadline}>
                              <Clock size={14} />
                              {formatDate(task.end_date)}
                            </span>
                            <a 
                              href={`/dashboard/case-details/${task.case_id}`}
                              className={styles.taskCaseLink}
                            >
                              <Briefcase size={14} />
                              {task.cases.case_no}
                            </a>
                          </div>
                        </div>
                        <div className={styles.deadlineIndicator}>
                          <span className={styles.daysLeft}>
                            {Math.ceil((new Date(task.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyStateMessage}>
                    <p>No upcoming tasks in the next week</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Hearings Card */}
            <div className={styles.hearingsCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardHeaderTitle}>
                  <Calendar size={20} />
                  <span>Upcoming Hearings</span>
                </h2>
              </div>
              
              <div className={styles.hearingsContent}>
                {upcomingHearings.length > 0 ? (
                  <div className={styles.hearingsList}>
                    {upcomingHearings.map((hearing, index) => (
                      <div className={styles.hearingItem} key={`${hearing.case_id}-${index}`}>
                        <div className={styles.hearingDate}>
                          <div className={styles.dateMonth}>
                            {new Date(hearing.next_date).toLocaleString('default', { month: 'short' })}
                          </div>
                          <div className={styles.dateDay}>
                            {new Date(hearing.next_date).getDate()}
                          </div>
                        </div>
                        <div className={styles.hearingDetails}>
                          <a 
                            href={`/dashboard/case-details/${hearing.case_id}`}
                            className={styles.hearingCaseNo}
                          >
                            Case: {hearing.cases.case_no}
                          </a>
                          <div className={styles.hearingCourt}>
                            <span>{hearing.cases.court}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyStateMessage}>
                    <p>No upcoming hearings in the next month</p>
                  </div>
                )}
              </div>
            </div>
            {/* Case Analytics Card */}
            <div className={styles.analyticsCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardHeaderTitle}>
                  <BarChart4 size={20} />
                  <span>Case Status Analytics</span>
                </h2>
                <button 
                  className={styles.toggleDetailsButton}
                  onClick={toggleCaseDetails}
                >
                  {showCaseDetails ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              <div className={styles.analyticsContent}>
                {!showCaseDetails ? (
                  <div className={styles.chartWrapper}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                ) : (
                  <div className={styles.caseDetailsWrapper}>
                    <div className={styles.caseStatusSummary}>
                      <div className={`${styles.statusCard} ${styles.inProgressCard}`}>
                        <div className={styles.statusIcon}>
                          <TimerIcon size={24} />
                        </div>
                        <div className={styles.statusCount}>{caseStatusCounts.in_progress}</div>
                        <div className={styles.statusLabel}>In Progress</div>
                      </div>
                      
                      <div className={`${styles.statusCard} ${styles.onHoldCard}`}>
                        <div className={styles.statusIcon}>
                          <PauseCircle size={24} />
                        </div>
                        <div className={styles.statusCount}>{caseStatusCounts.on_hold}</div>
                        <div className={styles.statusLabel}>On Hold</div>
                      </div>
                      
                      <div className={`${styles.statusCard} ${styles.completedCard}`}>
                        <div className={styles.statusIcon}>
                          <CheckCircle2 size={24} />
                        </div>
                        <div className={styles.statusCount}>{caseStatusCounts.completed}</div>
                        <div className={styles.statusLabel}>Completed</div>
                      </div>
                    </div>
                    
                    <div className={styles.caseDetailsTables}>
                      <div className={styles.detailSection}>
                        <h3 className={styles.detailSectionTitle}>In-Progress Cases</h3>
                        <div className={styles.caseChips}>
                          {caseDetails.in_progress.length > 0 ? (
                            caseDetails.in_progress.map(caseInfo => (
                              <a 
                                key={caseInfo.case_id} 
                                href={`/dashboard/case-details/${caseInfo.case_id}`} 
                                className={`${styles.caseChip} ${styles.inProgressChip}`}
                              >
                                {caseInfo.case_no}
                              </a>
                            ))
                          ) : (
                            <span className={styles.noCasesMessage}>No cases</span>
                          )}
                        </div>
                      </div>
                      
                      <div className={styles.detailSection}>
                        <h3 className={styles.detailSectionTitle}>On Hold Cases</h3>
                        <div className={styles.caseChips}>
                          {caseDetails.on_hold.length > 0 ? (
                            caseDetails.on_hold.map(caseInfo => (
                              <a 
                                key={caseInfo.case_id} 
                                href={`/dashboard/case-details/${caseInfo.case_id}`} 
                                className={`${styles.caseChip} ${styles.onHoldChip}`}
                              >
                                {caseInfo.case_no}
                              </a>
                            ))
                          ) : (
                            <span className={styles.noCasesMessage}>No cases</span>
                          )}
                        </div>
                      </div>
                      
                      <div className={styles.detailSection}>
                        <h3 className={styles.detailSectionTitle}>Completed Cases</h3>
                        <div className={styles.caseChips}>
                          {caseDetails.completed.length > 0 ? (
                            caseDetails.completed.map(caseInfo => (
                              <a 
                                key={caseInfo.case_id} 
                                href={`/dashboard/case-details/${caseInfo.case_id}`} 
                                className={`${styles.caseChip} ${styles.completedChip}`}
                              >
                                {caseInfo.case_no}
                              </a>
                            ))
                          ) : (
                            <span className={styles.noCasesMessage}>No cases</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        </>
      )}
    </div>
  );
};

export default CommonDashboard;