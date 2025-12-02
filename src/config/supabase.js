import { createClient } from "@supabase/supabase-js";

// Ambil dari environment variables
const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    "https://nlspaernjscgaggjzujy.supabase.co";
const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sc3BhZXJuanNjZ2FnZ2p6dWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTQxMTEsImV4cCI6MjA3OTM5MDExMX0.jSmGgpAiWIUs2voqBWePS58WD7akCwXMVdg-2y6j7us";

// Validasi
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase credentials!");
    console.error(
        "Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file"
    );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // <--- UBAH JADI FALSE (Auto-Logout saat Refresh)
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});

// Storage bucket name
export const STORAGE_BUCKET = "bookletku";

// Default store ID
export const DEFAULT_STORE_ID = "00000000-0000-0000-0000-000000000001";

export default supabase;
