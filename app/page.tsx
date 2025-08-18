import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProblemsApp } from "@/components/problems-app"
import { getProblems } from "@/lib/actions"
import LoginForm from "@/components/login-form"

export default async function HomePage() {
  // Always show login form first, regardless of Supabase configuration
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Bem-vindo ao Sistema de Gestão de Problemas
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Faça login para continuar
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                <strong>Credenciais de teste:</strong><br/>
                Email: admin@teste.com<br/>
                Senha: 123456
              </p>
            </div>
          </div>
          <LoginForm />
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
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                Erro de Configuração
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Problema na configuração do Supabase. Tente novamente.
              </p>
            </div>
          </div>
        </div>
      )
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Erro de Sistema
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ocorreu um erro inesperado. Tente novamente.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
