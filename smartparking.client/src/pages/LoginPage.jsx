import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // 1️⃣ LOGIN
        const res = await fetch("https://localhost:7237/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            alert("Invalid credentials");
            return;
        }

        // 2️⃣ FETCH LOGGED-IN USER
        const meRes = await fetch("https://localhost:7237/api/auth/me", {
            credentials: "include",
        });

        if (meRes.ok) {
            const userData = await meRes.json();

            // 🔥 VERY IMPORTANT
            setUser(userData);   // { userId, email }

            // 3️⃣ REDIRECT TO HOME
            navigate("/");
        } else {
            alert("Login failed");
        }
    };

    return (
        <div style={{ padding: "50px" }}>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
