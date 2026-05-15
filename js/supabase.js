
// ======================================================
// SUPABASE CLIENT - INICIALIZAÇÃO E EXPOSIÇÃO GLOBAL
// ======================================================

// Utiliza as configurações do config.js
const supabaseUrl = window.CONFIG.SUPABASE_URL;
const supabaseAnonKey = window.CONFIG.SUPABASE_ANON_KEY;

// Inicializa o cliente Supabase
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Torna disponível globalmente
window.supabase = supabaseClient;
