import { useContext, useState, useEffect } from "react";
import Styles from "./resetpassword.module.css";
import { useNavigate } from "react-router-dom";
import { usercontext } from "../appcontext";
import { toast } from "react-toastify";

function Forgotpassword() {
    const navigate = useNavigate();
    const [email, setemail] = useState("");
    const [otp, setotp] = useState(["", "", "", "", "", ""]);
    const [newpassword, setnewpassword] = useState("");
    const [confirmpassword, setconfirmpassword] = useState("");
    const [isloading, setisloading] = useState(false);
    const [isemailpresent, setisemailpresent] = useState(false);
    const [isemailverified, setisemailverified] = useState(false);
    const { backendURL, islogged } = useContext(usercontext);
    const [showpass, setshowpass] = useState(false);
    const [showconfirmpass, setshowconfirmpass] = useState(false);

    useEffect(() => {
        if (islogged) {
            navigate("/");
        }
    }, [islogged, navigate]);

    const handleInput = (index, event) => {
        const val = event.target.value;
        if (index < 5 && val !== "" && val.replace(/\D/, "") !== "") {
            const nextElem = document.getElementById(index + 1);
            if (nextElem) nextElem.focus();
        }
        if (val.replace(/\D/, "") !== "") {
            var tem = [...otp];
            tem[index] = val;
            setotp(tem);
        }
        if (val.replace(/\D/, "") === "") {
            event.target.value = "";
        }
    };

    const handlebck = (index, event) => {
        if (event.key === "Backspace") {
            if (index > 0) {
                event.target.value = "";
                const prevElem = document.getElementById(index - 1);
                if (prevElem) prevElem.focus();
                event.preventDefault();
            }
            var tem = [...otp];
            tem[index] = "";
            event.target.value = "";
            setotp(tem);
        } else {
            if (event.target.value.length === 1 && index < 5 && event.target.value.replace(/\D/, "") !== "") {
                const nextElem = document.getElementById(index + 1);
                if (nextElem) nextElem.focus();
            }
        }
    };

    function validateEmail(emailStr) {
        const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailregex.test(emailStr);
    }

    const verifyemail = () => {
        if (email.trim() === "") {
            toast.warn("Email must not be empty");
            return;
        }
        if (!validateEmail(email.trim())) {
            toast.warn("Invalid Email");
            return;
        }
        setisloading(true);
        fetch(`${backendURL}/resetOtpSent`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "email": email.trim() })
        })
            .then(response => {
                if (response.ok) {
                    toast.success("OTP sent to your email");
                    setisloading(false);
                    setisemailpresent(true);
                } else {
                    toast.error("Invalid or unregistered email");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Verification failed");
                setisloading(false);
            });
    };

    const verifyprocess = () => {
        var enteredOtp = "";
        otp.forEach((i) => enteredOtp += i);
        if (enteredOtp.length < 6) {
            toast.error("Fill all OTP digits");
            return;
        }
        setisloading(true);
        fetch(`${backendURL}/verifyResetOtp`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "email": email.trim(), "otp": enteredOtp })
        })
            .then(response => {
                if (response.ok) {
                    toast.success("OTP verified. Set your new password");
                    setisloading(false);
                    setisemailverified(true);
                } else {
                    setotp(["", "", "", "", "", ""]);
                    toast.error("Invalid OTP code");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Verification failed");
                setisloading(false);
            });
    };

    const resetpasswordsent = () => {
        var enteredOtp = "";
        otp.forEach((i) => enteredOtp += i);
        if (newpassword.length < 6) {
            toast.warn("Password must be at least 6 characters");
            return;
        }
        if (!(newpassword === confirmpassword)) {
            toast.warn("Passwords do not match");
            return;
        }
        setisloading(true);
        fetch(`${backendURL}/resetPassword`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "email": email.trim(), "otp": enteredOtp, "password": newpassword })
        })
            .then(response => {
                if (response.ok) {
                    toast.success("Password changed successfully");
                    setisloading(false);
                    setotp(["", "", "", "", "", ""]);
                    setemail("");
                    setnewpassword("");
                    setisemailverified(false);
                    setisemailpresent(false);
                    setshowpass(false);
                    setconfirmpassword("");
                    setshowconfirmpass(false);
                    navigate("/login");
                } else {
                    toast.error("Error resetting password");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Resetting failed");
                setisloading(false);
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

                <button className={Styles.homeBtn} onClick={() => navigate("/login")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Login
                </button>
            </nav>

            {!isemailpresent && !isemailverified && (
                <div className={Styles.mailcontainer}>
                    <div className={Styles.titleArea}>
                        <h1>Reset Password</h1>
                        <p>Enter your account email to receive a password reset OTP code</p>
                    </div>

                    <input
                        className={Styles.mailcontainerinput}
                        onChange={(event) => setemail(event.target.value)}
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="off"
                        placeholder="Registered Email"
                        value={email}
                    />

                    <button onClick={verifyemail} disabled={isloading}>
                        {isloading ? "Sending OTP..." : "Send Verification Code"}
                    </button>
                </div>
            )}

            {isemailpresent && !isemailverified && (
                <div className={Styles.verifycontainer}>
                    <div className={Styles.titleArea}>
                        <h1>Verify Reset Code</h1>
                        <p>Enter the 6-digit OTP code sent to {email}</p>
                    </div>

                    <div className={Styles.otpcontainer}>
                        {otp.map((value, index) => (
                            <input
                                inputMode="numeric"
                                maxLength={1}
                                placeholder="•"
                                key={index}
                                value={value}
                                autoComplete="off"
                                type="text"
                                className={Styles.otpinp}
                                id={index}
                                onChange={(e) => handleInput(index, e)}
                                onKeyDown={(e) => handlebck(index, e)}
                            />
                        ))}
                    </div>

                    <button onClick={verifyprocess} disabled={isloading}>
                        {isloading ? "Verifying..." : "Verify Code"}
                    </button>
                </div>
            )}

            {isemailpresent && isemailverified && (
                <div className={Styles.mailcontainer}>
                    <div className={Styles.titleArea}>
                        <h1>Set New Password</h1>
                        <p>Choose a strong new password for your account</p>
                    </div>

                    <div className={Styles.passdiv}>
                        <input
                            onChange={(event) => setnewpassword(event.target.value)}
                            type={showpass ? "text" : "password"}
                            name="password"
                            id="password"
                            autoComplete="off"
                            placeholder="New Password"
                        />
                        <i className={`fa-solid ${showpass ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setshowpass(!showpass)}></i>
                    </div>

                    <div className={Styles.passdiv}>
                        <input
                            type={showconfirmpass ? "text" : "password"}
                            name="confirmpassword"
                            id="confirmpassword"
                            onChange={(event) => setconfirmpassword(event.target.value)}
                            placeholder="Confirm New Password"
                            autoComplete="off"
                            value={confirmpassword}
                        />
                        <i className={`fa-solid ${showconfirmpass ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setshowconfirmpass(!showconfirmpass)}></i>
                    </div>

                    <button onClick={resetpasswordsent} disabled={isloading}>
                        {isloading ? "Updating..." : "Update Password"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Forgotpassword;