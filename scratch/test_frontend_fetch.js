import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
  envContent.split(/\r?\n/).filter(line => line.includes('=')).map(line => {
    let [k, ...v] = line.split('=');
    return [k.trim(), v.join('=').replace(/^"|"$/g, '').trim()];
  })
);

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function testFetch() {
    console.log("Authenticating as boris...");
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'boris_castro_a@hotmail.com',
        password: '25091978.Bo'
    });
    
    if (authErr) {
        console.error("Auth Error:", authErr.message);
        return;
    }
    
    const user = authData.user;
    console.log("Logged in as:", user.id);
    
    console.log("Fetching parcels with nested telemetry...");
    const { data, error } = await supabase.from('parcels').select(`
        *,
        sat_telemetry ( * ),
        alerts_events ( * )
    `).eq('producer_id', user.id).order('created_at', { ascending: false });
    
    if (error) {
        console.error("❌ Fetch Error:", error.message, "(Code:", error.code, ")");
    } else {
        console.log("✅ Fetch Success! Found parcels:", data.length);
        if (data.length > 0) {
            console.log("Sample parcel telemetry count:", data[0].sat_telemetry?.length || 0);
        }
    }
}

testFetch();
