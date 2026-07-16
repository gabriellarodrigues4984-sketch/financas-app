import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockDb'

// Modo de pré-visualização local: quando VITE_LOCAL_PREVIEW=true (definido em
// .env.local, que nunca é enviado ao GitHub), o app roda 100% no navegador,
// sem Supabase real e sem tela de login do Google. Ótimo para testar mudanças
// antes de subir para produção.
export const isLocalPreview = import.meta.env.VITE_LOCAL_PREVIEW === 'true'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isLocalPreview && !isSupabaseConfigured) {
  // Fails loudly in dev so misconfiguration is obvious instead of a silent blank screen.
  console.error(
    'Faltam variáveis de ambiente VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Copie .env.example para .env e preencha com os dados do seu projeto Supabase ' +
      '(ou, na Vercel/Netlify, confira Settings > Environment Variables).'
  )
}

// Usa uma URL "válida" de placeholder quando as variáveis não estão configuradas,
// só para o createClient não travar a página inteira (tela branca) — o app mostra
// um aviso explicando o problema em vez de simplesmente quebrar. Veja App.tsx.
export const supabase: any = isLocalPreview
  ? mockSupabase
  : createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
