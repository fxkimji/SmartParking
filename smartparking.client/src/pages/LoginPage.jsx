import { useState } from "react";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        const res = await fetch("https://localhost:7237/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            window.location.href = "/home";
        } else {
            alert("Invalid credentials");
        }
    };

    return (
        <div style={{ padding: "50px" }}>
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
