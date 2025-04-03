import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import styles from "./CaseDetails.module.css";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Trash2,
  Upload,
  History,
  Pencil,
  UserCircle2,
  File,
  Phone,
  Mail,
  Users,
  FileText,
  DollarSign,
  Clock,
  Briefcase,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import {  FaArrowLeft } from 'react-icons/fa';


const CaseDetails = ({ userInfo }) => {
  // All state variables and hooks
  const [isOwner, setIsOwner] = useState(false);
  const [buttonTitle, setButtonTitle] = useState("Take Over");
  const [selectedLawyerId, setSelectedLawyerId] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const { t } = useTranslation();
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [clientsData, setClientsData] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [selectedClientIds, setSelectedClientIds] = useState([]);

  const [oppositePartyData, setOppositePartyData] = useState([]);
  const [alloppositeParties, setAllOppositeParty] = useState([]);
  const [selectedOppositePartyIds, setSelectedOppositePartyIds] = useState([]);

  const [lawyerData, setLawyerData] = useState(null);
  const [caseTypeData, setCaseTypeData] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("in-progress");
  const [fees, setFees] = useState([]);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("clients");
  const [activeOppositePartyTab, setActiveOppositePartyTab] = useState("list");

  // Document handling states
  const [newDocuments, setNewDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Use userInfo or fallback to localStorage
  const lawyerId = userInfo?.lawyer_id || localStorage.getItem("lawyerId");

  const fetchAllLawyers = async () => {
    try {
      const { data: allLawyersData, error } = await supabase
        .from("attorney_at_law")
        .select("*");
      if (error) throw new Error(error.message);
      setLawyers(allLawyersData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Fetch case details and related information when the component mounts
  useEffect(() => {
    fetchDetails();
    fetchAllClients();
    fetchAllOppositeParties();
    fetchTasks();
    checkLawyerOwnership();
    fetchAllLawyers();
  }, [caseId]);

  // This is taking the lawyers from the DB and setting it to layer variable
  const checkLawyerOwnership = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("lawyer_id")
        .eq("case_id", caseId)
        .single();

      if (error) throw error;

      const caseLawyerId = data.lawyer_id;

      if (caseLawyerId === lawyerId) {
        setIsOwner(true);
        setButtonTitle("Handover");
      } else {
        setIsOwner(false);
        setButtonTitle("Take Over");
      }
    } catch (err) {
      console.error("Error fetching lawyer ID:", err.message);
    }
  };

  const handleHandover = async () => {
    if (!selectedLawyerId) {
      alert("Please select a lawyer to hand over the case.");
      return;
    }

    try {
      const { error } = await supabase
        .from("cases")
        .update({ lawyer_id: selectedLawyerId })
        .eq("case_id", caseId);

      if (error) throw error;
      setIsOwner(false);
      setButtonTitle("Take Over");
      fetchDetails();
      alert("Case handed over successfully!");
    } catch (err) {
      console.error("Error during handover:", err.message);
    }
  };

  const handleTakeOver = async () => {
    try {
      const { error } = await supabase
        .from("cases")
        .update({ lawyer_id: lawyerId })
        .eq("case_id", caseId);

      if (error) throw error;
      setIsOwner(true);
      setButtonTitle("Handover");

      alert("You have taken over the case successfully!");
      fetchDetails();
    } catch (err) {
      console.error("Error during take over:", err.message);
    }
  };

  const handleClick = () => {
    if (buttonTitle === "Handover") {
      handleHandover();
    } else {
      handleTakeOver();
    }
  };

  const fetchDetails = async () => {
    try {
      // Fetch case details
      const { data: caseDetail } = await supabase
        .from("cases")
        .select("*")
        .eq("case_id", caseId)
        .single();

      setCaseData(caseDetail);
      setCurrentStatus(caseDetail.current_status || "in-progress");

      // Fetch clients associated with this case using client_case table
      const { data: clientCases } = await supabase
        .from("client_case")
        .select("client_id")
        .eq("case_id", caseId);

      if (clientCases.length > 0) {
        // Fetch client details for each client_id obtained
        const clientIds = clientCases.map((clientCase) => clientCase.client_id);

        // Ensure that clientIds is not empty before querying
        if (clientIds.length > 0) {
          const { data: clientsDetail, error: clientsError } = await supabase
            .from("clients")
            .select("*")
            .in("client_id", clientIds);

          if (clientsError) throw new Error(clientsError.message);

          // Update state with fetched clients data
          setClientsData(clientsDetail);
        } else {
          console.warn("No client IDs found for fetching details.");
        }
      }

      // Fetch OppositeParty associated with this case using case_oppositeparty table
      const { data: OppositePartyCases } = await supabase
        .from("case_oppositeparty")
        .select("oppositeparty_id")
        .eq("case_id", caseId);

      if (OppositePartyCases.length > 0) {
        // Fetch OppositeParty details for each OppositeParty_Id obtained
        const OppositePartyIds = OppositePartyCases.map(
          (OppositePartyCase) => OppositePartyCase.oppositeparty_id
        );
        const { data: OppositePartyDetail, error: OppositePartyError } =
          await supabase
            .from("opposite_parties")
            .select("*")
            .in("oppositeparty_id", OppositePartyIds);

        if (OppositePartyError) throw new Error(OppositePartyError.message);
        setOppositePartyData(OppositePartyDetail);
      }

      // Fetch lawyer details
      if (caseDetail.lawyer_id) {
        const { data: lawyerDetail } = await supabase
          .from("attorney_at_law")
          .select("*")
          .eq("lawyer_id", caseDetail.lawyer_id)
          .single();

        setLawyerData(lawyerDetail || null);
      } else {
        setLawyerData(null);
      }

      // Fetch current updates for the specific case
      const { data: updateData, error: updateError } = await supabase
        .from("case_updates")
        .select("*")
        .eq("case_id", caseId)
        .order("next_date", { ascending: false })
        .limit(1);

      if (updateError) throw new Error(updateError.message);

      if (updateData && updateData.length > 0) {
        setUpdates(updateData);
      } else {
        setUpdates([]);
      }

      // Fetch tasks for the specific case
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("case_id", caseId);

      if (taskError) throw new Error(taskError.message);
      setTasks(taskData);

      // Fetch fee details for the specific case
      const { data: feeData, error: feeError } = await supabase
        .from("fee_details")
        .select("*")
        .eq("case_id", caseId);

      if (feeError) throw new Error(feeError.message);
      setFees(feeData);

      // Fetch the corresponding case type using the case_type_id from the fetched case detail

      if (caseDetail.case_type_id) {
        const { data: caseTypeDetail, error: caseTypeError } = await supabase
          .from("case_types")
          .select("*")
          .eq("id", caseDetail.case_type_id)
          .single();

        if (caseTypeError) throw new Error(caseTypeError.message);
        setCaseTypeData(caseTypeDetail);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchAllClients = async () => {
    try {
      const { data: allClientsData, error } = await supabase
        .from("clients")
        .select("*");
      if (error) throw new Error(error.message);
      setAllClients(allClientsData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleClientSelectionChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedClientIds(value);
  };

  const handleAddClientsToCase = async () => {
    try {
      let duplicateClients = [];

      for (const clientId of selectedClientIds) {
        const { data: existingEntry } = await supabase
          .from("client_case")
          .select("*")
          .eq("case_id", caseId)
          .eq("client_id", clientId)
          .single();

        if (!existingEntry) {
          await supabase.from("client_case").insert({
            case_id: caseId,
            client_id: clientId,
          });
          alert("Clients added successfully!");
        } else {
          duplicateClients.push(clientId);
        }
      }

      if (duplicateClients.length > 0) {
        const duplicateClientNames = await Promise.all(
          duplicateClients.map(async (id) => {
            const { data: clientNameEntry } = await supabase
              .from("clients")
              .select("name")
              .eq("client_id", id)
              .single();
            return clientNameEntry ? clientNameEntry.name : id;
          })
        );
        alert(
          `The following clients are already associated with this case and cannot be added again: ${duplicateClientNames.join(
            ", "
          )}`
        );
      }

      fetchDetails();
    } catch (err) {
      console.error(err);
      alert(`Failed to add clients: ${err.message}`);
    }
  };

  const fetchAllOppositeParties = async () => {
    try {
      const { data: allOppositePartyData, error } = await supabase
        .from("opposite_parties")
        .select("*");
      if (error) throw new Error(error.message);
      setAllOppositeParty(allOppositePartyData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleOppositePartySelectionChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedOppositePartyIds(value);
  };

  const handleAddOppositePartyToCase = async () => {
    try {
      let duplicateOppositeParties = [];

      for (const OppositePartyId of selectedOppositePartyIds) {
        const { data: existingEntry } = await supabase
          .from("case_oppositeparty")
          .select("*")
          .eq("case_id", caseId)
          .eq("oppositeparty_id", OppositePartyId)
          .single();

        if (!existingEntry) {
          await supabase.from("case_oppositeparty").insert({
            case_id: caseId,
            oppositeparty_id: OppositePartyId,
          });
          alert("OppositeParty added successfully!");
        } else {
          duplicateOppositeParties.push(OppositePartyId);
        }
      }

      if (duplicateOppositeParties.length > 0) {
        const duplicateOppositePartiesNames = await Promise.all(
          duplicateOppositeParties.map(async (id) => {
            const { data: OppositePartyNameEntry } = await supabase
              .from("opposite_parties")
              .select("name")
              .eq("oppositeparty_id", id)
              .single();
            return OppositePartyNameEntry ? OppositePartyNameEntry.name : id;
          })
        );
        alert(
          `The following OppositeParties are already associated with this case and cannot be added again: ${duplicateOppositePartiesNames.join(
            ", "
          )}`
        );
      }

      fetchDetails();
    } catch (err) {
      console.error(err);
      alert(`Failed to add OppositeParties: ${err.message}`);
    }
  };

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setCurrentStatus(newStatus);

    try {
      const { error } = await supabase
        .from("cases")
        .update({ current_status: newStatus })
        .eq("case_id", caseId);

      if (error) throw new Error(error.message);
      console.log("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setNewDocuments([...e.dataTransfer.files]);
      setUploadError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = [...e.target.files];
      setNewDocuments(files);
      setUploadError(null);
    }
  };

  const handleUploadDocuments = async () => {
    if (newDocuments.length === 0) {
      setUploadError("No documents selected for upload.");
      return;
    }

    try {
      setUploadProgress(0);
      setUploadError(null);
      const urls = [];
      const totalFiles = newDocuments.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = newDocuments[i];
        const fileName = `${Date.now()}_${file.name}`;

        const { error } = await supabase.storage
          .from("case-documents")
          .upload(fileName, file);

        if (error) throw error;

        const url = `${supabase.supabaseUrl}/storage/v1/object/public/case-documents/${fileName}`;
        urls.push(url);

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      const { error: updateError } = await supabase
        .from("cases")
        .update({
          case_documents: [...(caseData.case_documents || []), ...urls],
        })
        .eq("case_id", caseId);

      if (updateError) throw updateError;

      setNewDocuments([]);
      setUploadProgress(0);

      if (document.querySelector('input[type="file"]')) {
        document.querySelector('input[type="file"]').value = null;
      }

      alert("Documents uploaded successfully!");
      fetchDetails();
    } catch (err) {
      console.error(err);
      setUploadError(`Failed to upload documents: ${err.message}`);
    }
  };

  const handleDeleteDocument = async (docUrl) => {
    const fileName = docUrl
      .substring(docUrl.lastIndexOf("/") + 1)
      .split("?")[0];

    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        const { error: deleteError } = await supabase.storage
          .from("case-documents")
          .remove([fileName]);
        if (deleteError) throw deleteError;

        const updatedDocuments = caseData.case_documents.filter(
          (url) => url !== docUrl
        );
        const { error: updateError } = await supabase
          .from("cases")
          .update({
            case_documents: updatedDocuments,
          })
          .eq("case_id", caseId);

        if (updateError) throw updateError;

        alert("Document deleted successfully!");
        fetchDetails();
      } catch (err) {
        console.error(err);
        alert(`Failed to delete document: ${err.message}`);
      }
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("case_id", caseId);
    if (error) {
      setError(error.message);
    } else {
      setTasks(data);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("task_id", taskId);
      if (error) {
        setError(error.message);
      } else {
        fetchTasks();
      }
    }
  };

  const handleDeleteClient = async (clientId, caseId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this client from the case?"
      )
    ) {
      try {
        const { error } = await supabase
          .from("client_case")
          .delete()
          .eq("client_id", clientId)
          .eq("case_id", caseId);

        if (error) {
          throw new Error(error.message);
        }

        setClientsData((prevClients) =>
          prevClients.filter((client) => client.client_id !== clientId)
        );
      } catch (err) {
        console.error("Error deleting client:", err);
      }
    }
  };

  const handleDeleteOppositeParty = async (OppositePartyId, caseId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this oppositeparty from the case?"
      )
    ) {
      try {
        const { error } = await supabase
          .from("case_oppositeparty")
          .delete()
          .eq("oppositeparty_id", OppositePartyId)
          .eq("case_id", caseId);

        if (error) {
          throw new Error(error.message);
        }

        setOppositePartyData((prevOppositeParty) =>
          prevOppositeParty.filter(
            (OppositeParty) =>
              OppositeParty.oppositeparty_id !== OppositePartyId
          )
        );
      } catch (err) {
        console.error("Error deleting client:", err);
      }
    }
  };

  return (
    <div className={styles.caseDetailsContainer}>
      {error && <div className={styles.errorNotification}>{error}</div>}

      <header className={styles.pageHeader}>
        <button
          className={styles["back-button"]}
          onClick={() => navigate(-1)}
          aria-label={t("Back")}
        >
          <FaArrowLeft  className={styles['header-icon']}/>
        </button>
        <h1>{t("CaseDetails")}</h1>
        <div></div>
      </header>

      {/* Main Information Section */}
      <div className={styles.infoSections}>
        {/* Case Information Section */}

        {caseData && (
          <section className={styles.caseInfoSection}>
            <h2 className={styles.sectionTitle}>
              <Briefcase className={styles.sectionIcon} />
              {t("Case Information")}
            </h2>
            <div className={styles.caseDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t("CaseNo")}</span>
                <span className={styles.detailValue}>{caseData.case_no}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t("CaseType")}</span>
                <span className={styles.detailValue}>
                  {caseTypeData ? caseTypeData.case_type : t("Loading")}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t("OpenedDate")}</span>
                <span className={styles.detailValue}>
                  {new Date(caseData.opened_date).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t("Court")}:</span>
                <span className={styles.detailValue}>{caseData.court}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t("Status")}:</span>
                <div className={styles.statusSelectWrapper}>
                  <select
                    value={currentStatus}
                    onChange={handleStatusChange}
                    className={styles.statusSelect}
                  >
                    <option value="in_progress">{t("InProgress")}</option>
                    <option value="on_hold">{t("OnHold")}</option>
                    <option value="completed">{t("Completed")}</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Attorney Information Section */}
        <section className={styles.attorneySection}>
          <h2 className={styles.sectionTitle}>
            <UserCircle2 className={styles.sectionIcon} />
            {t("Attorney Information")}
          </h2>

          {lawyerData ? (
            <div className={styles.attorneyProfile}>
              <div className={styles.attorneyAvatar}>
                <UserCircle2 size={64} />
              </div>
              <div className={styles.attorneyDetails}>
                <h3 className={styles.attorneyName}>{lawyerData.name}</h3>
                <div className={styles.contactDetails}>
                  {lawyerData.contact_no && (
                    <div className={styles.contactItem}>
                      <Phone className={styles.contactIcon} />
                      <span>{lawyerData.contact_no}</span>
                    </div>
                  )}
                  {lawyerData.email && (
                    <div className={styles.contactItem}>
                      <Mail className={styles.contactIcon} />
                      <span>{lawyerData.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noAttorneyAlert}>
              <AlertTriangle className={styles.alertIcon} />
              <p>{t("This case is not taken by an Attorney yet.")}</p>
            </div>
          )}

          {/* Handover/Takeover Section */}
          <div className={styles.caseOwnershipActions}>
            <h3 className={styles.ownershipTitle}>
              {isOwner ? t("Handover Case") : t("Take Over Case")}
            </h3>

            {isOwner ? (
              <div className={styles.handoverControls}>
                <select
                  onChange={(e) => setSelectedLawyerId(e.target.value)}
                  value={selectedLawyerId || ""}
                  className={styles.lawyerSelect}
                >
                  <option value="">{t("Select Lawyer")}</option>
                  {lawyers.map((lawyer) => (
                    <option key={lawyer.lawyer_id} value={lawyer.lawyer_id}>
                      {lawyer.name}
                    </option>
                  ))}
                </select>
                <button onClick={handleClick} className={styles.actionButton}>
                  {buttonTitle}
                </button>
              </div>
            ) : (
              <button onClick={handleClick} className={styles.actionButton}>
                {buttonTitle}
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Tab Navigation took it as a list */}
      <div className={styles.tabNavigation}>
        {[
          { key: "clients", icon: <Users />, label: t("ClientName") },
          {
            key: "rivalParties",
            icon: <MessageSquare />,
            label: t("OppositeParty"),
          },
          { key: "tasks", icon: <Clock />, label: t("Tasks/steps") },
          { key: "fee", icon: <DollarSign />, label: t("Fee") },
          { key: "documents", icon: <FileText />, label: t("Documents") },
          { key: "status", icon: <History />, label: t("Status") },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tabButton} ${
              activeTab === tab.key ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Clients Tab */}
        {activeTab === "clients" && (
          <div>
            <div className={styles.contentHeader}>
              <h3>{t("Clients List")}</h3>
              <button
                onClick={() => navigate(`/clients/add`)}
                className={styles.addButton}
              >
                <Plus /> {t("Add")}
              </button>
            </div>

            {clientsData.length > 0 ? (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("Name")}</th>
                    <th>{t("ContactNo")}</th>
                    <th>{t("Email")}</th>
                    <th>{t("Profession")}</th>
                    <th>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsData.map((client) => (
                    <tr key={client.client_id}>
                      <td>{client.name}</td>
                      <td>{client.contact_no}</td>
                      <td>{client.email}</td>
                      <td>{client.profession}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() =>
                              navigate(
                                `client-view/${client.client_id}/${caseId}`
                              )
                            }
                            className={styles.viewButton}
                            title={t("ViewClient")}
                          >
                            <UserCircle2 className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/clients/update/${client.client_id}`)
                            }
                            className={styles.editButton}
                            title={t("EditClient")}
                          >
                            <Pencil className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClient(client.client_id, caseId)
                            }
                            className={styles.deleteButton}
                            title={t("DeleteClient")}
                          >
                            <Trash2 className={styles.actionIcon} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.emptyState}>{t("NoClientsAdded")}</p>
            )}

            {/* Add Clients Section */}
            <div className={styles.addSection}>
              <h3>{t("AddClientsToCase")}</h3>
              <select
                multiple
                className={styles.multiSelect}
                onChange={handleClientSelectionChange}
              >
                {allClients.map((client) => (
                  <option key={client.client_id} value={client.client_id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddClientsToCase}
                className={styles.addButton}
              >
                <Plus /> {t("AddClients")}
              </button>
            </div>
          </div>
        )}

        {/* Rival Parties Tab */}
        {activeTab === "rivalParties" && (
          <div>
            <div className={styles.contentHeader}>
              <h3>{t("OppositePartiesList")}</h3>
              <button
                className={styles.addButton}
                onClick={() => navigate(`/rival-party/${caseId}`)}
              >
                <Plus /> {t("CreateOppositeParty")}
              </button>
            </div>

            {oppositePartyData.length > 0 ? (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("Name")}</th>
                    <th>{t("Address")}</th>
                    <th>{t("ContactNo")}</th>
                    <th>{t("RivalCounsel")}</th>
                    <th>{t("GSDivision")}</th>
                    <th>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {oppositePartyData.map((party) => (
                    <tr key={party.oppositeparty_id}>
                      <td>{party.name}</td>
                      <td>{party.address}</td>
                      <td>{party.contact_no}</td>
                      <td>{party.rival_counsel}</td>
                      <td>{party.gs_division}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() =>
                              navigate(
                                `/rival-party/update/${party.oppositeparty_id}/${caseId}`
                              )
                            }
                            className={styles.editButton}
                            title={t("EditOppositeParty")}
                          >
                            <Pencil className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteOppositeParty(
                                party.oppositeparty_id,
                                caseId
                              )
                            }
                            className={styles.deleteButton}
                            title={t("DeleteOppositeParty")}
                          >
                            <Trash2 className={styles.actionIcon} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.emptyState}>{t("NoOppositePartiesAdded")}</p>
            )}

            {/* Add Opposite Parties Section */}
            <div className={styles.addSection}>
              <h3>{t("AddExistingOppositeParties")}</h3>
              <select
                multiple
                className={styles.multiSelect}
                onChange={handleOppositePartySelectionChange}
              >
                {alloppositeParties.map((party) => (
                  <option
                    key={party.oppositeparty_id}
                    value={party.oppositeparty_id}
                  >
                    {party.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddOppositePartyToCase}
                className={styles.addButton}
              >
                <Plus /> {t("AddOppositeParties")}
              </button>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div>
            <div className={styles.contentHeader}>
              <h3>{t("TasksList")}</h3>
              <button
                onClick={() => navigate(`/task/${caseId}`)}
                className={styles.addButton}
              >
                <Plus /> {t("AddTask")}
              </button>
            </div>

            {tasks.length > 0 ? (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("TaskName")}</th>
                    <th>{t("StartDate")}</th>
                    <th>{t("Deadline")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.task_id}>
                      <td>{task.task_name}</td>
                      <td>{new Date(task.start_date).toLocaleDateString()}</td>
                      <td>{new Date(task.end_date).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[task.status.toLowerCase()]
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() =>
                              navigate(`/task/update/${task.task_id}/${caseId}`)
                            }
                            className={styles.editButton}
                            title={t("EditTask")}
                          >
                            <Pencil className={styles.actionIcon} />
                          </button>
                          <button
                            onClick={() => handleDelete(task.task_id)}
                            className={styles.deleteButton}
                            title={t("DeleteTask")}
                          >
                            <Trash2 className={styles.actionIcon} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.emptyState}>{t("NoTasksFound")}</p>
            )}
          </div>
        )}

        {/* Fee Tab */}
        {activeTab === "fee" && (
          <div>
            <div className={styles.contentHeader}>
              <h3>{t("FeeDetails")}</h3>
              <button
                onClick={() => navigate(`/fee/add/${caseId}`)}
                className={styles.addButton}
              >
                <Plus /> {t("AddFeeDetails")}
              </button>
            </div>

            {fees.length > 0 ? (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("Date")}</th>
                    <th>{t("Amount")}</th>
                    <th>{t("Purpose")}</th>
                    <th>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.fee_id}>
                      <td>{new Date(fee.date).toLocaleDateString()}</td>
                      <td className={styles.amountCell}>
                        {t("Currency")}
                        {fee.amount.toFixed(2)}
                      </td>
                      <td>{fee.purpose}</td>
                      <td>
                        <button
                          onClick={() =>
                            navigate(`/fee/update/${fee.fee_id}/${caseId}`)
                          }
                          className={styles.editButton}
                          title={t("EditFee")}
                        >
                          <Pencil className={styles.actionIcon} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.emptyState}>{t("NoFeeDetailsFound")}</p>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div>
            <div className={styles.contentHeader}>
              <h3>{t("CaseDocuments")}</h3>
            </div>

            {/* Document Upload Area */}
            <div
              className={`${styles.documentDropzone} ${
                isDragging ? styles.dragging : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={styles.dropzoneContent}>
                <Upload size={48} className={styles.uploadIcon} />
                <p className={styles.dragText}>{t("DragDocumentsHere")}</p>
                <p className={styles.orText}>{t("Or")}</p>
                <label className={styles.fileInputLabel}>
                  {t("BrowseFiles")}
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                </label>
              </div>

              {uploadError && (
                <div className={styles.uploadError}>
                  <p>{uploadError}</p>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className={styles.uploadProgress}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <span>{uploadProgress}%</span>
                </div>
              )}

              {newDocuments.length > 0 && (
                <div className={styles.selectedFiles}>
                  <h4>{t("SelectedFiles")}:</h4>
                  <ul className={styles.filesList}>
                    {newDocuments.map((file, index) => (
                      <li key={index} className={styles.fileItem}>
                        <File className={styles.fileIcon} />
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleUploadDocuments}
                    className={styles.uploadButton}
                    disabled={uploadProgress > 0 && uploadProgress < 100}
                  >
                    <Upload /> {t("UploadDocuments")}
                  </button>
                </div>
              )}
            </div>

            {/* Document Table */}
            <h4 className={styles.sectionSubtitle}>{t("UploadedDocuments")}</h4>
            {caseData &&
            caseData.case_documents &&
            caseData.case_documents.length > 0 ? (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("FileName")}</th>
                    <th>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {caseData.case_documents.map((docUrl, index) => {
                    const fileName = docUrl
                      .substring(docUrl.lastIndexOf("/") + 1)
                      .split("?")[0];
                    return (
                      <tr key={index}>
                        <td>
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.documentLink}
                          >
                            <File className={styles.fileIcon} /> {fileName}
                          </a>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteDocument(docUrl)}
                            className={styles.deleteButton}
                            title={t("DeleteDocument")}
                          >
                            <Trash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className={styles.emptyState}>{t("NoDocumentsFound")}</p>
            )}
          </div>
        )}

        {/* Status Tab */}
        {activeTab === "status" && (
          <div>
            <div className={styles.contentHeader}>
              <h3>{t("CaseStatus")}</h3>
              <div className={styles.headerActions}>
                <button
                  onClick={() => navigate(`/casestatus/${caseId}`)}
                  className={styles.addButton}
                >
                  <Plus /> {t("AddUpdate")}
                </button>
                <button
                  onClick={() => navigate(`/case-history/${caseId}`)}
                  className={styles.historyButton}
                  title={t("CaseHistory")}
                >
                  <History /> {t("ViewHistory")}
                </button>
              </div>
            </div>

            {updates.length > 0 ? (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{t("PreviousDate")}</th>
                    <th>{t("Description")}</th>
                    <th>{t("NextStep")}</th>
                    <th>{t("NextDate")}</th>
                    <th>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.map((update) => (
                    <tr key={update.case_update_id}>
                      <td>
                        {new Date(update.previous_date).toLocaleDateString()}
                      </td>
                      <td>{update.description}</td>
                      <td>{update.next_step}</td>
                      <td>{new Date(update.next_date).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() =>
                            navigate(
                              `/casestatus/${update.case_update_id}/${caseId}`
                            )
                          }
                          className={styles.editButton}
                          title={t("EditUpdate")}
                        >
                          <Pencil />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.emptyState}>{t("NoUpdatesFound")}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseDetails;
