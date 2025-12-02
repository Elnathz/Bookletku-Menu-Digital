import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (userId) => {
        try {
            const { data } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();
            setProfile(data || { role: "user", name: "", avatar_url: "" });
        } catch (err) {
            console.error("Error fetch profile:", err);
        }
    };

    useEffect(() => {
        let mounted = true;

        // FUNGSI UTAMA: Cek Sesi saat aplikasi dibuka
        const initSession = async () => {
            try {
                // 1. Coba ambil sesi yang tersimpan
                // Kita tunggu max 2 detik, kalau macet berarti token bermasalah
                const { data, error } = await supabase.auth.getSession();

                [cite_start]; // 2. DETEKSI TOKEN RUSAK (KUNCI PERBAIKAN) [cite: 76]
                // Jika ada error saat ambil sesi (biasanya "Invalid Refresh Token"),
                // kita harus PAKSA LOGOUT agar aplikasi tidak kirim token sampah lagi.
                if (error) {
                    console.warn(
                        "Sesi kadaluwarsa/rusak. Membersihkan token...",
                        error.message
                    );
                    await supabase.auth.signOut(); // <--- INI SOLUSINYA
                    if (mounted) {
                        setUser(null);
                        setProfile(null);
                    }
                    return;
                }

                // 3. Jika sesi valid, set user
                if (data.session?.user && mounted) {
                    setUser(data.session.user);
                    await fetchUserProfile(data.session.user.id);
                }
            } catch (error) {
                console.error("Auth Init Exception:", error);
                // Jika error parah, pastikan user null agar jadi 'Tamu'
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initSession();

        // Listener Realtime (Login/Logout)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (mounted) {
                // Event khusus jika Token Refresh Gagal (misal koneksi putus atau token dicabut)
                // Kita logout paksa agar UI tidak nge-freeze
                if (event === "TOKEN_REFRESHED" && !session) {
                    console.log("Gagal refresh token. Logout otomatis.");
                    await supabase.auth.signOut();
                }

                if (session?.user) {
                    setUser(session.user);
                    if (!profile || profile.id !== session.user.id) {
                        await fetchUserProfile(session.user.id);
                    }
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email, password, name, role = "user") => {
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
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return { data, error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (user) await fetchUserProfile(user.id);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                isAdmin: profile?.role === "admin",
                isUser: profile?.role === "user",
                isAuthenticated: !!user,
                signUp,
                signIn,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthContext;
