import { useContext, useEffect, useState } from "react";
import Styles from "./analyse.module.css";
import { usercontext } from "../appcontext";
import { useNavigate } from "react-router-dom";

function Analyse() {
    const navigate = useNavigate();
    const [reportsList, setReportsList] = useState([]);
    const [selectedReportIndex, setSelectedReportIndex] = useState(0);

    const [score, setscore] = useState(0);
    const [atsscore, setatsscore] = useState(0);
    const [fileName, setfileName] = useState("");
    const [fileData, setfileData] = useState("");
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [pros, setpros] = useState([]);
    const [cons, setcons] = useState([]);
    const [sug, setsug] = useState([]);
    const [jobs, setjobs] = useState([]);
    const { serviceURL } = useContext(usercontext);
    const [isfetched, setisfetched] = useState(false);

    const loadReport = (data) => {
        if (!data) return;
        setscore(data.score || 0);
        setatsscore(data.atsoptimizationscore || 0);
        setfileName(data.fileName || "Uploaded_Resume.pdf");
        setfileData(data.fileData || "");
        setpros(data.pros || []);
        setcons(data.cons || []);
        setsug(data.suggestions || []);
        setjobs(data.jobs || []);
    };

    useEffect(() => {
        const loadingElem = document.getElementById("animate");
        if (loadingElem) loadingElem.style.display = "flex";

        fetch(`${serviceURL}/lastReport`, { credentials: "include" })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    if (loadingElem) loadingElem.style.display = "none";
                    return null;
                }
            })
            .then(data => {
                if (data != null) {
                    const list = Array.isArray(data) ? data : [data];
                    setReportsList(list);
                    if (list.length > 0) {
                        loadReport(list[0]);
                        setSelectedReportIndex(0);
                        setisfetched(true);
                    }
                }
                if (loadingElem) loadingElem.style.display = "none";
            })
            .catch(error => {
                console.error(error);
                if (loadingElem) loadingElem.style.display = "none";
            });
    }, [serviceURL]);

    return (
        <div className={Styles.container}>
            <div className={Styles.glowBg1}></div>
            <div className={Styles.glowBg2}></div>

            {/* Navbar */}
            <nav className={Styles.nav}>
                <div className={Styles.brand} onClick={() => navigate("/")}>
                    <div className={Styles.brandIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </div>
                    <h1>Resume Analyser</h1>
                </div>

                <div className={Styles.navActions}>
                    <button className={Styles.actionBtn} onClick={() => navigate("/uploaddoc")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Analyse Another
                    </button>
                </div>
            </nav>

            {/* Fullscreen Loader */}
            <div className={Styles.loadani} id="animate">
                <div className={Styles.loadanimation}></div>
                <h1>Preparing Analysis Report...</h1>
            </div>

            {isfetched ? (
                <div className={Styles.doc}>
                    {/* Analysis History Selection Bar */}
                    {reportsList.length > 1 && (
                        <div className={Styles.historyBar}>
                            <div className={Styles.historyTitle}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>Analysis History ({reportsList.length} Uploaded Resumes)</span>
                            </div>
                            <div className={Styles.historyList}>
                                {reportsList.map((item, idx) => {
                                    const isSelected = idx === selectedReportIndex;
                                    const formattedDate = item.createdAt 
                                        ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
                                        : `Report #${reportsList.length - idx}`;
                                    return (
                                        <button
                                            key={item.id || idx}
                                            className={`${Styles.historyChip} ${isSelected ? Styles.historyChipActive : ""}`}
                                            onClick={() => {
                                                setSelectedReportIndex(idx);
                                                loadReport(item);
                                            }}
                                        >
                                            <div className={Styles.chipHeader}>
                                                <span className={Styles.chipName}>{item.fileName || "Uploaded_Resume.pdf"}</span>
                                                <span className={Styles.chipBadge}>{item.score}/100</span>
                                            </div>
                                            <div className={Styles.chipMeta}>
                                                {item.roles ? `${item.roles} • ` : ""}{formattedDate}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Resume Document Header */}
                    <div className={Styles.docHeader}>
                        <div className={Styles.docInfo}>
                            <div className={Styles.docIcon}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                            </div>
                            <div>
                                <span className={Styles.docLabel}>Analyzed Document</span>
                                <h3 className={Styles.docName}>{fileName || "Uploaded_Resume.pdf"}</h3>
                            </div>
                        </div>

                        {fileData && (
                            <button className={Styles.viewResumeBtn} onClick={() => setShowPreviewModal(true)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <span>View Resume</span>
                            </button>
                        )}
                    </div>
                    {/* Score Gauges */}
                    <div className={Styles.report}>
                        <div className={Styles.scoreCard}>
                            <div className={Styles.gaugeContainer}>
                                <svg viewBox="0 0 120 120" className={Styles.gaugeSvg}>
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="60" cy="60" r="50" className={Styles.gaugeBg} />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        className={Styles.gaugeProgress1}
                                        style={{
                                            strokeDasharray: 314,
                                            strokeDashoffset: 314 - (314 * Math.min(Math.max(score, 0), 100)) / 100
                                        }}
                                    />
                                </svg>
                                <div className={Styles.gaugeCenterText}>
                                    <span className={Styles.gaugeScoreVal} style={{ color: '#3b82f6' }}>{score}</span>
                                    <span className={Styles.gaugeScoreMax}>/100</span>
                                </div>
                            </div>
                            <span className={Styles.scoreLabel}>Overall Score</span>
                            <span className={Styles.scoreSublabel}>General resume strength</span>
                        </div>

                        <div className={Styles.scoreCard}>
                            <div className={Styles.gaugeContainer}>
                                <svg viewBox="0 0 120 120" className={Styles.gaugeSvg}>
                                    <defs>
                                        <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#34d399" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="60" cy="60" r="50" className={Styles.gaugeBg} />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        className={Styles.gaugeProgress2}
                                        style={{
                                            strokeDasharray: 314,
                                            strokeDashoffset: 314 - (314 * Math.min(Math.max(atsscore, 0), 100)) / 100
                                        }}
                                    />
                                </svg>
                                <div className={Styles.gaugeCenterText}>
                                    <span className={Styles.gaugeScoreVal} style={{ color: '#10b981' }}>{atsscore}</span>
                                    <span className={Styles.gaugeScoreMax}>/100</span>
                                </div>
                            </div>
                            <span className={Styles.scoreLabel}>ATS Optimization</span>
                            <span className={Styles.scoreSublabel}>Algorithm parser readiness</span>
                        </div>
                    </div>

                    {/* Breakdown Sections */}
                    <div className={Styles.rev}>
                        {/* Strengths */}
                        {pros.length > 0 && (
                            <div className={Styles.cardSection}>
                                <div className={`${Styles.sectionHeader} ${Styles.prosHeader}`}>
                                    <div className={Styles.sectionTitle}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        Key Strengths
                                    </div>
                                    <span className={`${Styles.badgePill} ${Styles.prosBadge}`}>
                                        {pros.length} Highlights
                                    </span>
                                </div>
                                <ul className={Styles.sectionList}>
                                    {pros.map((item, index) => (
                                        <li key={index} className={Styles.listItem}>
                                            <span className={Styles.proBullet}>✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvements */}
                        {cons.length > 0 && (
                            <div className={Styles.cardSection}>
                                <div className={`${Styles.sectionHeader} ${Styles.consHeader}`}>
                                    <div className={Styles.sectionTitle}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                        Areas for Improvement
                                    </div>
                                    <span className={`${Styles.badgePill} ${Styles.consBadge}`}>
                                        {cons.length} Issues
                                    </span>
                                </div>
                                <ul className={Styles.sectionList}>
                                    {cons.map((item, index) => (
                                        <li key={index} className={Styles.listItem}>
                                            <span className={Styles.conBullet}>✕</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Suggestions */}
                        {sug.length > 0 && (
                            <div className={Styles.cardSection}>
                                <div className={`${Styles.sectionHeader} ${Styles.sugHeader}`}>
                                    <div className={Styles.sectionTitle}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5">
                                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"></path>
                                        </svg>
                                        Tips to Enhance
                                    </div>
                                    <span className={`${Styles.badgePill} ${Styles.sugBadge}`}>
                                        {sug.length} Tips
                                    </span>
                                </div>
                                <ul className={Styles.sectionList}>
                                    {sug.map((item, index) => (
                                        <li key={index} className={Styles.listItem}>
                                            <span className={Styles.sugBullet}>💡</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Suggested Jobs */}
                        {jobs.length > 0 && (
                            <div className={Styles.cardSection}>
                                <div className={`${Styles.sectionHeader} ${Styles.jobsHeader}`}>
                                    <div className={Styles.sectionTitle}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                        </svg>
                                        Matched Job Vacancies
                                    </div>
                                    <span className={`${Styles.badgePill} ${Styles.jobsBadge}`}>
                                        {jobs.length} Matches
                                    </span>
                                </div>

                                <div className={Styles.jobsGrid}>
                                    {jobs.map((item, index) => (
                                        <div className={Styles.jobCard} key={index}>
                                            <div>
                                                <h3 className={Styles.jobTitle}>{item.title}</h3>
                                                <div className={Styles.metaBadgeRow}>
                                                    <span className={Styles.jobMeta}>
                                                        🏢 {item.company?.display_name?.trim() || "Company"}
                                                    </span>
                                                    <span className={Styles.jobMeta}>
                                                        📍 {item.location?.display_name?.trim() || "Remote / Various"}
                                                    </span>
                                                </div>
                                                <p className={Styles.jobDes}>{item.description}</p>
                                            </div>

                                            <a
                                                className={Styles.jobLink}
                                                href={item.redirect_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>Apply Now</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                    <polyline points="15 3 21 3 21 9"></polyline>
                                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                                </svg>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className={Styles.errCard}>
                    <h2>No Previous Report Found</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
                        Please upload your resume to generate a detailed analysis report.
                    </p>
                    <button className={Styles.actionBtn} onClick={() => navigate("/uploaddoc")}>
                        Upload Resume Now
                    </button>
                </div>
            )}

            {/* Document Preview Modal */}
            {showPreviewModal && (
                <div className={Styles.modalOverlay} onClick={() => setShowPreviewModal(false)}>
                    <div className={Styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={Styles.modalHeader}>
                            <div className={Styles.modalTitle}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                <span>{fileName || "Resume Preview"}</span>
                            </div>
                            <button className={Styles.closeBtn} onClick={() => setShowPreviewModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className={Styles.modalBody}>
                            {fileData ? (
                                <iframe src={fileData} title="Resume Preview" className={Styles.previewFrame}></iframe>
                            ) : (
                                <div className={Styles.noFilePrompt}>
                                    <p>No preview data available for this document.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Analyse;