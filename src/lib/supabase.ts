import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kqecqrekjabvfhltqzpb.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWNxcmVramFidmZobHRxenBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTM2MTcsImV4cCI6MjA4NTA4OTYxN30.IOpcRJh7YUqpgRzfGYsEsYjOse9IdWr5H8EY1XrqlhY";

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
