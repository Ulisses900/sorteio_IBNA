// ======================================================
// CONFIGURAÇÃO GLOBAL (SUBSTITUA COM SEUS DADOS)
// ======================================================

// Configurações do Supabase
const SUPABASE_URL = 'https://iwvflbhqfrzohcufkbxt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VdTdIJvTHKLfuuJ1PS0FFg_aGu8PY0z';

// Número do WhatsApp da loja (apenas dígitos)
const WHATSAPP_SELLER_NUMBER = '5581999227456';                    // SUBSTITUIR

// Nome do bucket do Storage para as imagens dos produtos
const STORAGE_BUCKET = 'product-images';

window.CONFIG = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    WHATSAPP_SELLER_NUMBER,
    STORAGE_BUCKET
};
