import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fungsi helper untuk mengambil role user dari tabel user_profiles
    const fetchUserRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", userId)
                .single();

            if (data) {
                setUserRole(data.role);
            } else {
                setUserRole("user"); // Default
            }
        } catch (err) {
            console.error("Fetch role error:", err);
            setUserRole("user");
        }
    };

    useEffect(() => {
        // 1. Cek sesi saat ini (Initial Load)
        const initSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    await fetchUserRole(session.user.id);
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error("Session check error:", error);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // 2. Dengarkan perubahan Auth secara Realtime
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event); // Debugging

            if (
                event === "SIGNED_IN" ||
                event === "TOKEN_REFRESHED" ||
                event === "INITIAL_SESSION"
            ) {
                if (session?.user) {
                    setUser(session.user);
                    // Hanya fetch role jika belum ada atau user berubah
                    if (session.user.id !== user?.id) {
                        await fetchUserRole(session.user.id);
                    }
                }
            } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
                setUser(null);
                setUserRole(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email, password, name, role = "user") => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } },
            });
            if (error) throw error;

            // Buat profile manual jika trigger database gagal/belum diset
            if (data.user) {
                await supabase.from("user_profiles").upsert({
                    id: data.user.id,
                    email,
                    name,
                    role,
                });
            }
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    };

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
    };

    // Helper untuk refresh session manual jika diperlukan
    const refreshSession = async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (data.session) {
            setUser(data.session.user);
            return true;
        }
        return false;
    };

    const isAdmin = userRole === "admin";
    const isUser = userRole === "user";
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                userRole,
                loading,
                isAdmin,
                isUser,
                isAuthenticated,
                signUp,
                signIn,
                signOut,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

export default AuthContext;
