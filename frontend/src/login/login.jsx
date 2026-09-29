import { useContext, useState, useEffect } from "react";
import Styles from "./login.module.css";
import { toast } from "react-toastify";
import { usercontext } from "../appcontext";
import { useNavigate, Link } from "react-router-dom";
import GoogleButton from "../googlebtn.jsx";

function Login() {
    const navigate = useNavigate();
    const [islogin, setislogin] = useState(true);
    const { backendURL, setisprevious, setusername, setemail: setContextEmail, setislogged, islogged } = useContext(usercontext);
    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [confirmpassword, setconfirmpassword] = useState("");
    const [isloading, setisloading] = useState(false);
    const [isemailverified, setemailverified] = useState(false);
    const [otp, setotp] = useState(["", "", "", "", "", ""]);
    const [showpass, setshowpass] = useState(false);
    const [showconfirmpass, setshowconfirmpass] = useState(false);

    useEffect(() => {
        if (islogged) {
            navigate("/");
        }
    }, [islogged, navigate]);

    function validateEmail(emailStr) {
        const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailregex.test(emailStr);
    }

    const submit = (event) => {
        event.preventDefault();
        if (!islogin) {
            if (name.trim() === "") {
                toast.warn("Username must not be empty");
                return;
            }
            if (email.trim() === "") {
                toast.warn("Email must not be empty");
                return;
            }
            if (!validateEmail(email.trim())) {
                toast.warn("Invalid Email");
                return;
            }
            if (password.length < 6) {
                toast.warn("Password must have at least 6 characters");
                return;
            }
            if (!(password === confirmpassword)) {
                toast.warn("Passwords do not match");
                return;
            }
            setisloading(true);
            fetch(`${backendURL}/verifyEmail`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: name.trim(), email: email.trim() })
            })
                .then(response => {
                    setisloading(false);
                    if (response.ok) {
                        toast.success("OTP sent to your email!");
                        setemailverified(true);
                    } else if (response.status === 409) {
                        toast.error("Email already registered");
                    } else {
                        // Fallback to direct registration if verifyEmail fails
                        fetch(`${backendURL}/register`, {
                            method: "post",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ username: name.trim(), email: email.trim(), password: password, verifyotp: "" })
                        })
                            .then(res => {
                                if (res.ok) {
                                    setname("");
                                    setemail("");
                                    setpassword("");
                                    setconfirmpassword("");
                                    toast.success("Account created successfully");
                                    setislogin(true);
                                } else if (res.status === 409) {
                                    toast.error("Email already registered");
                                } else {
                                    toast.error("Signup failed");
                                }
                            });
                    }
                })
                .catch(() => {
                    toast.error("Signup Failed");
                    setisloading(false);
                });
        } else {
            if (email.trim() === "") {
                toast.warn("Email must not be empty");
                return;
            }
            if (!validateEmail(email.trim())) {
                toast.warn("Invalid Email");
                return;
            }
            if (password.length < 6) {
                toast.warn("Password must have at least 6 characters");
                return;
            }
            setisloading(true);
            fetch(`${backendURL}/login`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password: password }),
                credentials: 'include'
            })
                .then(response => {
                    if (response.ok) {
                        setemail("");
                        setpassword("");
                        setisloading(false);
                        setshowpass(false);
                        toast.success("Successfully logged in");
                        return response.json();
                    } else {
                        setisloading(false);
                        toast.error("Invalid credentials");
                        return null;
                    }
                })
                .then(data => {
                    if (data != null) {
                        setislogged(true);
                        setusername(data.username);
                        if (data.email) setContextEmail(data.email);
                        setisprevious(data.isPrevious);
                        navigate("/");
                    }
                })
                .catch(() => {
                    toast.error("Login Failed");
                    setisloading(false);
                });
        }
    };

    function switchmth() {
        setname("");
        setemail("");
        setpassword("");
        setshowpass(false);
        setshowconfirmpass(false);
        setconfirmpassword("");
        setislogin(!islogin);
    }

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

    const verifyprocess = () => {
        var enteredOtp = "";
        otp.forEach((i) => enteredOtp += i);
        if (enteredOtp.length < 6) {
            toast.error("Fill all OTP digits");
            return;
        }
        setisloading(true);
        fetch(`${backendURL}/register`, {
            method: "post",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "username": name.trim(), "email": email.trim(), "password": password, "verifyotp": enteredOtp })
        })
            .then(response => {
                if (response.ok) {
                    setotp(["", "", "", "", "", ""]);
                    setname("");
                    setemail("");
                    setpassword("");
                    toast.success("Account created successfully");
                    setisloading(false);
                    setemailverified(false);
                    setshowpass(false);
                    setshowconfirmpass(false);
                    setconfirmpassword("");
                    setislogin(true);
                } else {
                    setotp(["", "", "", "", "", ""]);
                    toast.error("Invalid OTP code");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Network Error");
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

                <button className={Styles.homeBtn} onClick={() => navigate("/")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Home
                </button>
            </nav>

            {!isemailverified ? (
                <div className={Styles.logincontainer}>
                    <div className={Styles.titleArea}>
                        <h1>{islogin ? "Welcome Back" : "Create Account"}</h1>
                        <p>{islogin ? "Enter your credentials to access your resume reports" : "Sign up to start analysing your resume today"}</p>
                    </div>

                    <form onSubmit={submit}>
                        {!islogin && (
                            <div className={Styles.inputGroup}>
                                <input
                                    className={Styles.logincontainerinput}
                                    onChange={(event) => setname(event.target.value)}
                                    type="text"
                                    name="username"
                                    id="username"
                                    maxLength={20}
                                    autoComplete="off"
                                    value={name}
                                    placeholder="Username"
                                />
                            </div>
                        )}

                        <div className={Styles.inputGroup}>
                            <input
                                type="email"
                                className={Styles.logincontainerinput}
                                onChange={(event) => setemail(event.target.value)}
                                name="email"
                                id="email"
                                value={email}
                                autoComplete="off"
                                placeholder="Email Address"
                            />
                        </div>

                        <div className={Styles.passdiv}>
                            <input
                                type={showpass ? "text" : "password"}
                                onChange={(event) => setpassword(event.target.value)}
                                name="password"
                                id="password"
                                value={password}
                                autoComplete="off"
                                placeholder="Password"
                            />
                            <i className={`fa-solid ${showpass ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setshowpass(!showpass)}></i>
                        </div>

                        {!islogin && (
                            <div className={Styles.passdiv}>
                                <input
                                    type={showconfirmpass ? "text" : "password"}
                                    name="confirmpassword"
                                    id="confirmpassword"
                                    onChange={(event) => setconfirmpassword(event.target.value)}
                                    placeholder="Confirm Password"
                                    autoComplete="off"
                                    value={confirmpassword}
                                />
                                <i className={`fa-solid ${showconfirmpass ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setshowconfirmpass(!showconfirmpass)}></i>
                            </div>
                        )}

                        {islogin && (
                            <Link className={Styles.linkdis} to="/forgotpassword">
                                <span className={Styles.forgetpass}>Forgot password?</span>
                            </Link>
                        )}

                        <button className={Styles.logincontainerbutton} type="submit" disabled={isloading}>
                            {isloading ? "Processing..." : islogin ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    <p className={Styles.switchText}>
                        {islogin ? "Don't have an account?" : "Already have an account?"}
                        <span className={Styles.logincontainerspan} onClick={switchmth}>
                            {islogin ? "Sign Up" : "Log In"}
                        </span>
                    </p>

                    <div className={Styles.divider}>
                        <span>OR</span>
                    </div>

                    <GoogleButton disabled={isloading} />
                </div>
            ) : (
                <div className={Styles.verifycontainer}>
                    <div className={Styles.titleArea}>
                        <h1>Verify Email</h1>
                        <p>Enter the 6-digit OTP code sent to your registered email address</p>
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

                    <button className={Styles.verbtn} disabled={isloading} onClick={verifyprocess}>
                        {isloading ? "Verifying..." : "Verify Code"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Login;