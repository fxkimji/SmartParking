/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            try {
                const res = await fetch(
                    "https://localhost:7237/api/auth/me",
                    { credentials: "include" }
                );

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);   
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            }
            setLoading(false);
        }

        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
