import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev so misconfiguration is obvious instead of a silent blank screen.
  console.error(
    'Faltam variáveis de ambiente VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Copie .env.example para .env e preencha com os dados do seu projeto Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
