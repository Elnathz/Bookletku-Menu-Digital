import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null); // Ganti userRole dengan object profile lengkap
    const [loading, setLoading] = useState(true);

    // Fetch profil lengkap (role, name, avatar_url)
    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (data) {
                setProfile(data);
            } else {
                // Fallback default
                setProfile({ role: "user", name: "", avatar_url: "" });
            }
        } catch (err) {
            console.error("Fetch profile error:", err);
        }
    };

    useEffect(() => {
        // 1. Cek sesi saat ini
        const initSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    await fetchUserProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            } catch (error) {
                console.error("Session check error:", error);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // 2. Listener Auth Realtime
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (
                event === "SIGNED_IN" ||
                event === "TOKEN_REFRESHED" ||
                event === "INITIAL_SESSION"
            ) {
                if (session?.user) {
                    setUser(session.user);
                    await fetchUserProfile(session.user.id);
                }
            } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
                setUser(null);
                setProfile(null);
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
        setProfile(null);
    };

    // Helper untuk refresh data profil manual (dipanggil setelah upload foto)
    const refreshProfile = async () => {
        if (user) {
            await fetchUserProfile(user.id);
        }
    };

    const isAdmin = profile?.role === "admin";
    const isUser = profile?.role === "user";
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                profile, // Objekt profil lengkap diexpose
                loading,
                isAdmin,
                isUser,
                isAuthenticated,
                signUp,
                signIn,
                signOut,
                refreshProfile, // Fungsi baru
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
