import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProblemsApp } from "@/components/problems-app"
import { getProblems } from "@/lib/actions"

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Configuração Necessária
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Configure as variáveis de ambiente do Supabase para continuar.
            </p>
          </div>
        </div>
      </div>
    )
  }

  try {
    // Check if user is logged in
    const supabase = await createClient()
    
    // Verificar se o cliente foi criado corretamente
    if (!supabase || !supabase.auth) {
      console.error("Supabase client not properly initialized")
      // Redirect to login instead of showing error page
      redirect("/auth/login")
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user, redirect to login
    if (!user) {
      redirect("/auth/login")
    }

    const problems = await getProblems()

    return <ProblemsApp initialProblems={problems} user={user} />
  } catch (error) {
    console.error("Error in HomePage:", error)
    // Redirect to login instead of showing error page
    redirect("/auth/login")
  }
}
