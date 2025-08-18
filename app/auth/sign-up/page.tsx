import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/sign-up-form"

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

export default async function SignUpPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Configuração Necessária</h1>
          <p className="text-gray-600">Configure as variáveis de ambiente do Supabase para continuar.</p>
        </div>
      </div>
    )
  }

  try {
    // Check if user is already logged in
    const supabase = await createClient()
    
    if (!supabase || !supabase.auth) {
      // Fallback if Supabase client creation fails
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <SignUpForm />
        </div>
      )
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is logged in, redirect to home page
    if (session) {
      redirect("/")
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <SignUpForm />
      </div>
    )
  } catch (error) {
    console.error("Sign-up page error:", error)
    // Fallback to sign-up form if anything fails
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <SignUpForm />
      </div>
    )
  }
}
