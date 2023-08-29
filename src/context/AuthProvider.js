import React, { useState, useEffect, createContext, useContext } from "react";

// Create an authentication context
const AuthContext = createContext();
export function AuthProvider({ children }) {
    const [authToken, setAuthToken] = useState("");

    useEffect(() => {
        const storedAuthToken = localStorage.getItem("authToken");
        if (storedAuthToken) {
            setAuthToken(storedAuthToken);
        }
    }, []);

    const updateAuthToken = (newAuthToken) => {
        setAuthToken(newAuthToken);
        localStorage.setItem("authToken", newAuthToken);
    };

    return (
        <AuthContext.Provider value={{ authToken, updateAuthToken }}>
            {children}
        </AuthContext.Provider>
    );
}
// Custom hook to access the authentication context

export function useAuthContext() {
    return useContext(AuthContext);
}
