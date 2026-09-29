import { toast } from "react-toastify";
import Styles from "./upload.module.css";
import { useContext, useState } from "react";
import { usercontext } from "../appcontext";
import { useNavigate } from "react-router-dom";

function Uploadpage() {
    const { serviceURL } = useContext(usercontext);
    const navigate = useNavigate();

    const [role, setRole] = useState("");
    const [fileName, setFileName] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    const popularRoles = [
        "Software Engineer",
        "Full Stack Developer",
        "Backend Developer",
        "Frontend Engineer",
        "Data Analyst",
        "DevOps Engineer",
        "Product Manager"
    ];

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
    };

    const validateFile = (file) => {
        if (!file) return false;
        
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!validTypes.includes(file.type)) {
            toast.error("Upload a resume in PDF or DOC/DOCX format");
            setFileName("");
            return false;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Upload a file less than 2 MB");
            setFileName("");
            return false;
        }

        let nameStr = file.name;
        if (nameStr.length > 25) {
            nameStr = nameStr.substring(0, 12) + "..." + nameStr.substring(nameStr.length - 8);
        }
        setFileName(nameStr);
        return true;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        validateFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const fileInput = document.getElementById("resume");
            
            // Create a DataTransfer object to assign file to input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            validateFile(file);
        }
    };

    const analysedoc = (event) => {
        event.preventDefault();
        var uploadform = document.getElementById("upform");
        var formdata = new FormData(uploadform);

        if (!role || role.trim() === "") {
            toast.warn("Target job role must not be empty");
            return;
        }

        const fileInput = document.getElementById("resume");
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            toast.warn("Please select a resume file");
            return;
        }

        const loadingElem = document.getElementById("animate");
        if (loadingElem) loadingElem.style.display = "flex";

        fetch(`${serviceURL}/extract`, { method: "post", body: formdata, credentials: "include" })
            .then(response => {
                if (response.ok) {
                    if (uploadform) uploadform.reset();
                    setFileName("");
                    setRole("");
                    if (loadingElem) loadingElem.style.display = "none";
                    navigate("/analysereport");
                } else {
                    if (uploadform) uploadform.reset();
                    toast.error("Irrelevant resume or role provided");
                    setFileName("");
                    if (loadingElem) loadingElem.style.display = "none";
                }
            })
            .catch(() => {
                toast.error("Network error. Please try again.");
                if (loadingElem) loadingElem.style.display = "none";
            });
    };

    return (
        <div className={Styles.container}>
            <div className={Styles.glowBg}></div>

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

                <button className={Styles.homeBtn} onClick={() => navigate("/")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Home
                </button>
            </nav>

            <main className={Styles.mainLayout}>
                {/* Upload Form Card */}
                <div className={Styles.uploadCard}>
                    <h2>Upload Your Resume</h2>
                    <p className={Styles.subtext}>Enter your target job position and upload your CV for AI evaluation.</p>

                    <form id="upform" onSubmit={analysedoc} encType="multipart/form-data">
                        <div className={Styles.inputGroup}>
                            <label className={Styles.label} htmlFor="roles">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                </svg>
                                Target Job Role
                            </label>
                            <input
                                type="text"
                                className={Styles.roleInput}
                                autoComplete="off"
                                placeholder="e.g., Senior Full Stack Engineer"
                                name="roles"
                                id="roles"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            />

                            <div className={Styles.quickRoles}>
                                {popularRoles.map((item, idx) => (
                                    <span key={idx} className={Styles.roleTag} onClick={() => handleRoleSelect(item)}>
                                        + {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* File Drop Zone */}
                        <label
                            htmlFor="resume"
                            className={`${Styles.dropZone} ${isDragOver ? Styles.dropZoneActive : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className={Styles.uploadIconCircle}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                            </div>

                            <p className={Styles.dropZoneText}>
                                {fileName ? "Change Selected File" : "Drag & drop your resume here, or browse"}
                            </p>
                            <p className={Styles.dropZoneSubtext}>Supports PDF, DOC, DOCX up to 2MB</p>

                            {fileName && (
                                <span className={Styles.fileBadge}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    {fileName}
                                </span>
                            )}
                        </label>

                        <input
                            type="file"
                            name="file"
                            onChange={handleFileChange}
                            id="resume"
                            hidden
                            accept=".pdf,.doc,.docx"
                        />

                        <button type="submit" className={Styles.submitBtn}>
                            <span>Analyse Resume</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </form>
                </div>

                {/* Guidelines Sidebar */}
                <div className={Styles.guidelinesCard}>
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Best Practices & Guidelines
                    </h2>

                    <div className={Styles.guidelineList}>
                        <div className={Styles.guidelineItem}>
                            <div className={Styles.itemIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                </svg>
                            </div>
                            <div className={Styles.itemText}>
                                <h4>Supported Format</h4>
                                <p>Upload your resume in PDF or DOC/DOCX format for accurate text extraction.</p>
                            </div>
                        </div>

                        <div className={Styles.guidelineItem}>
                            <div className={Styles.itemIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                    <line x1="8" y1="21" x2="16" y2="21"></line>
                                    <line x1="12" y1="17" x2="12" y2="21"></line>
                                </svg>
                            </div>
                            <div className={Styles.itemText}>
                                <h4>File Size Limit</h4>
                                <p>Keep your document file size under 2MB to ensure fast processing.</p>
                            </div>
                        </div>

                        <div className={Styles.guidelineItem}>
                            <div className={Styles.itemIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M2 12h20"></path>
                                </svg>
                            </div>
                            <div className={Styles.itemText}>
                                <h4>English Language</h4>
                                <p>Our AI model evaluates resumes written in English for skill matching.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Loading Overlay */}
            <div className={Styles.loadani} id="animate">
                <div className={Styles.loadanimation}></div>
                <h1>Analysing Resume & Calculating ATS Score...</h1>
            </div>
        </div>
    );
}

export default Uploadpage;