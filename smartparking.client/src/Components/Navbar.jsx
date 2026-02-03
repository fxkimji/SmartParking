import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import "../../css/navbar.css";

function Navbar() {
    const { user, setUser, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();

    const handleLogout = async () => {
        try {
            await fetch("https://localhost:7237/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (err) {
            console.error(err);
        }

        setUser(null);
        navigate("/login");
    };

    // close dropdown when clicked outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="navbar">
            {/* LEFT */}
            <div className="navbar-left">
                <div className="logo-box">P</div>
                <div className="brand-text">
                    <span className="brand-name">SmartPark</span>
                    <span className="brand-sub">Smart Parking India</span>
                </div>
            </div>

            {/* RIGHT */}
            <div className="navbar-right">
                <div className="bell">
                    <FaBell />
                    <span className="bell-badge">3</span>
                </div>

                {loading ? null : user ? (
                    <div className="user-section" ref={dropdownRef}>
                        {/* AVATAR */}
                        <div
                            className="user-avatar"
                            title={user.email}
                            onClick={() => setOpen(!open)}
                        >
                            {user.email.charAt(0).toUpperCase()}
                        </div>

                        {/* DROPDOWN */}
                        {open && (
                            <div className="profile-dropdown">
                                <div
                                    className="dropdown-item"
                                    onClick={() => {
                                        navigate("/profile");
                                        setOpen(false);
                                    }}
                                >
                                    👤 Profile
                                </div>

                                <div
                                    className="dropdown-item logout"
                                    onClick={handleLogout}
                                >
                                    🚪 Logout
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="guest">
                        <span>Guest</span>
                        <button
                            className="login-btn"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
