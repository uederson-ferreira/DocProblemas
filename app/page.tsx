import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProblemsApp } from "@/components/problems-app"
import { getProblems } from "@/lib/actions"
import LoginForm from "@/components/login-form"

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Always show login form first for now to avoid Vercel errors
  // TODO: Re-enable Supabase logic once environment is properly configured
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
