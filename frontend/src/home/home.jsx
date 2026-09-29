import Styles from "./home.module.css";
import { useContext, useEffect, useState } from "react";
import { usercontext } from "../appcontext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Home() {
    const navigate = useNavigate();
    const { islogged, username, email, isprevious, serviceURL, backendURL, setusername, setislogged, setisprevious } = useContext(usercontext);
    const [isshow, setshow] = useState(false);
    const [isloading, setisloading] = useState(false);
    const [delloading, setdelloading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showNewPass, setShowNewPass] = useState(false);
    const [resetOtp, setResetOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [updatingPass, setUpdatingPass] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest("#profileMenuTrigger") && !event.target.closest("#profileMenuDropdown")) {
                setshow(false);
            }
        };
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSendPasswordOtp = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        if (!email) {
            toast.error("Email session not found. Please log in again.");
            return;
        }
        setSendingOtp(true);
        try {
            const res = await fetch(`${backendURL}/resetOtpSent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email }),
                credentials: 'include'
            });
            if (res.ok) {
                toast.success("OTP sent to your email address!");
                setOtpSent(true);
            } else {
                const err = await res.text();
                toast.error(err || "Failed to send OTP");
            }
        } catch (e) {
            toast.error("Network error sending OTP");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!resetOtp || resetOtp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        setUpdatingPass(true);
        try {
            const res = await fetch(`${backendURL}/resetPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    otp: resetOtp,
                    password: newPassword
                }),
                credentials: 'include'
            });
            if (res.ok) {
                toast.success("Password changed successfully! 🔒");
                setShowProfileModal(false);
                setNewPassword("");
                setResetOtp("");
                setOtpSent(false);
            } else {
                const errText = await res.text();
                toast.error(errText || "Password change failed. Invalid OTP.");
            }
        } catch (e) {
            toast.error("Network error updating password");
        } finally {
            setUpdatingPass(false);
        }
    };

    const logout = () => {
        setisloading(true);
        fetch(`${serviceURL}/logout`, { method: "post", credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    setusername("");
                    setislogged(false);
                    setisprevious(false);
                    toast.success("Successfully Logged out");
                    setisloading(false);
                    navigate("/login");
                } else {
                    toast.error("Unauthorized access");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Logout failed");
                setisloading(false);
            });
    };

    const toggle = (e) => {
        e.stopPropagation();
        setshow(!isshow);
    };

    const confirmagain = () => {
        setshow(false);
        setShowDeleteModal(true);
    };

    const closedeldiv = () => {
        setShowDeleteModal(false);
    };

    const delaccount = () => {
        setdelloading(true);
        fetch(`${serviceURL}/deleteAccount`, { method: "post", credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    setislogged(false);
                    setShowDeleteModal(false);
                    setdelloading(false);
                    setusername("");
                    setisprevious(false);
                    navigate("/login");
                    toast.success("Account Deleted Successfully");
                } else {
                    toast.error("Couldn't delete account. Try again!");
                    setdelloading(false);
                }
            })
            .catch(() => {
                toast.error("Network Error");
                setdelloading(false);
            });
    };

    const upnavigate = () => {
        if (islogged) {
            navigate("/uploaddoc");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className={Styles.container}>
            <div className={Styles.glowBg1}></div>
            <div className={Styles.glowBg2}></div>

            {/* Navbar */}
            <nav className={Styles.nav}>
                <div className={Styles.brand} onClick={() => navigate("/")}>
                    <div className={Styles.brandIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <h1>Resume Analyser</h1>
                </div>

                {!islogged ? (
                    <button className={Styles.loginBtn} onClick={() => navigate("/login")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        Login
                    </button>
                ) : (
                    <div id="profileMenuTrigger" onClick={toggle} className={Styles.profile}>
                        {username ? username[0].toUpperCase() : "U"}
                    </div>
                )}
            </nav>

            {/* Profile Dropdown Popover */}
            {isshow && islogged && (
                <div id="profileMenuDropdown" className={Styles.profilemenu}>
                    <div className={Styles.menuHeader}>
                        <div className={Styles.menuAvatar}>
                            {username ? username[0].toUpperCase() : "U"}
                        </div>
                        <div className={Styles.menuUserInfo}>
                            <h2>{username}</h2>
                            <p>● Account Active</p>
                        </div>
                    </div>
                    <div className={Styles.pmenusec}>
                        <button onClick={() => { setShowProfileModal(true); setshow(false); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            My Profile & Security
                        </button>
                        <button onClick={logout} disabled={isloading}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Log Out
                        </button>
                        <button onClick={confirmagain} disabled={isloading} className={Styles.delBtn}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete Account
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Main Section */}
            <main className={Styles.hero}>
                <div className={Styles.badge}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>AI-POWERED RESUME INTELLIGENCE</span>
                </div>

                <h1>Elevate Your Career with Data-Driven Resume Analysis</h1>
                
                <p>
                    Benchmark your resume against industry ATS standards. Unlock detailed keyword scores, skill matching, formatting insights, and tailored job recommendations in seconds.
                </p>

                <div className={Styles.btncontainer}>
                    <button className={Styles.primaryBtn} disabled={isloading} onClick={upnavigate}>
                        <span>Analyse Resume</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>

                    {isprevious && (
                        <button className={Styles.secondaryBtn} disabled={isloading} onClick={() => navigate("/analysereport")}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Previous Analysis</span>
                        </button>
                    )}
                </div>
            </main>

            {/* Features Highlights Grid */}
            <section className={Styles.featuresGrid}>
                <div className={Styles.featureCard}>
                    <div className={`${Styles.featureIcon} ${Styles.iconBlue}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="m9 12 2 2 4-4"></path>
                        </svg>
                    </div>
                    <h3>ATS Optimization Score</h3>
                    <p>Evaluate your resume against algorithm parsers to guarantee maximum visibility with HR hiring filters.</p>
                </div>

                <div className={Styles.featureCard}>
                    <div className={`${Styles.featureIcon} ${Styles.iconCyan}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <h3>Deep Skill Analysis</h3>
                    <p>Identify strengths, formatting red flags, and essential technical keywords tailored specifically to your target job role.</p>
                </div>

                <div className={Styles.featureCard}>
                    <div className={`${Styles.featureIcon} ${Styles.iconPurple}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"></path>
                        </svg>
                    </div>
                    <h3>Actionable Tips</h3>
                    <p>Get instant personalized suggestions on impact verbs, bullet point phrasing, and structural layout improvements.</p>
                </div>

                <div className={Styles.featureCard}>
                    <div className={`${Styles.featureIcon} ${Styles.iconEmerald}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                    </div>
                    <h3>Smart Job Recommendations</h3>
                    <p>Discover real-time matching open vacancies aligned with your current experience and parsed skill set.</p>
                </div>
            </section>

            {/* Minimal Clean Footer */}
            <footer className={Styles.footer}>
                <div className={Styles.footerContent}>
                    <div className={Styles.brand} onClick={() => navigate("/")}>
                        <div className={Styles.brandIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </div>
                        <span className={Styles.footerBrandText}>Resume Analyser</span>
                    </div>

                    <p className={Styles.copyright}>© {new Date().getFullYear()} Resume Analyser. All rights reserved.</p>

                    <div className={Styles.socialLinks}>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className={Styles.socialIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect x="2" y="9" width="4" height="12"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>

            {/* Account Deletion Confirmation Modal */}
            {showDeleteModal && (
                <div className={Styles.delcontainer}>
                    <div className={Styles.confirmcontainer}>
                        <div className={Styles.warningIcon}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <h3>Delete Account?</h3>
                        <p>
                            Are you sure you want to permanently delete your account? All your analysis reports and saved data will be wiped out and cannot be recovered.
                        </p>
                        <div className={Styles.confirmationbtns}>
                            <button className={Styles.confirmdel} disabled={delloading} onClick={delaccount}>
                                {delloading ? "Deleting..." : "Delete Account"}
                            </button>
                            <button className={Styles.notnow} disabled={delloading} onClick={closedeldiv}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile & Security Modal */}
            {showProfileModal && (
                <div className={Styles.delcontainer} onClick={() => setShowProfileModal(false)}>
                    <div className={Styles.profileModalCard} onClick={(e) => e.stopPropagation()}>
                        <div className={Styles.profileModalHeader}>
                            <div className={Styles.modalHeaderLeft}>
                                <div className={Styles.profileAvatarBig}>
                                    {username ? username[0].toUpperCase() : "U"}
                                </div>
                                <div>
                                    <h2 className={Styles.profileModalTitle}>{username || "User Profile"}</h2>
                                    <span className={Styles.profileEmailBadge}>{email || "Account Profile"}</span>
                                </div>
                            </div>
                            <button className={Styles.profileCloseBtn} onClick={() => setShowProfileModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className={Styles.profileModalBody}>
                            {/* Account Details Box */}
                            <div className={Styles.detailsCardGroup}>
                                <h3 className={Styles.sectionHeading}>Account Details</h3>
                                <div className={Styles.detailField}>
                                    <label>Username / Name</label>
                                    <input type="text" value={username || ""} readOnly className={Styles.readOnlyInput} />
                                </div>
                                <div className={Styles.detailField}>
                                    <label>Email Address</label>
                                    <input type="text" value={email || ""} readOnly className={Styles.readOnlyInput} />
                                </div>
                            </div>

                            {/* Password Management */}
                            <div className={Styles.passwordCardGroup}>
                                <h3 className={Styles.sectionHeading}>Security & Change Password</h3>
                                <p className={Styles.passHint}>Enter a new password below. An OTP will be sent to your email to verify and confirm.</p>

                                <div className={Styles.detailField}>
                                    <label>New Password</label>
                                    <div className={Styles.passInputWrapper}>
                                        <input
                                            type={showNewPass ? "text" : "password"}
                                            placeholder="Enter new password (min 6 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={Styles.modalTextInput}
                                        />
                                        <button
                                            type="button"
                                            className={Styles.togglePassBtn}
                                            onClick={() => setShowNewPass(!showNewPass)}
                                        >
                                            {showNewPass ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>

                                {!otpSent ? (
                                    <button
                                        className={Styles.sendOtpBtn}
                                        onClick={handleSendPasswordOtp}
                                        disabled={sendingOtp || !newPassword}
                                    >
                                        {sendingOtp ? "Sending OTP..." : "Send Verification OTP"}
                                    </button>
                                ) : (
                                    <div className={Styles.otpVerifySection}>
                                        <div className={Styles.detailField}>
                                            <label>Enter 6-Digit OTP</label>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                placeholder="Enter OTP (e.g. 123456)"
                                                value={resetOtp}
                                                onChange={(e) => setResetOtp(e.target.value)}
                                                className={`${Styles.modalTextInput} ${Styles.otpInput}`}
                                            />
                                        </div>
                                        <button
                                            className={Styles.updatePassBtn}
                                            onClick={handleUpdatePassword}
                                            disabled={updatingPass || resetOtp.length !== 6}
                                        >
                                            {updatingPass ? "Updating Password..." : "Confirm & Update Password"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;