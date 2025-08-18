import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClientComponentClient()

// Types for our database
export interface Problem {
  id: string
  title: string
  description: string
  type: string // Agora suporta múltiplos tipos separados por vírgula
  severity: "critico" | "alto" | "medio" | "baixo"
  location?: string
  status: "pendente" | "resolvido"
  created_at: string
  updated_at: string
  user_id: string
  problem_number?: number
  recommendations?: string
  latitude_gms?: string // Coordenada GMS: "02 30 50 S"
  longitude_gms?: string // Coordenada GMS: "47 44 39 W"
  latitude_decimal?: number // Coordenada decimal: -2.513889
  longitude_decimal?: number // Coordenada decimal: -47.744167
}

export interface W5H2Plan {
  id: string
  problem_id: string
  what?: string
  why?: string
  when_plan?: string
  where_plan?: string
  who?: string
  how?: string
  how_much?: string
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  problem_id: string
  photo_url: string
  filename: string
  created_at: string
}
