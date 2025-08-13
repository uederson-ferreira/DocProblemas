import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProblemsApp } from "@/components/problems-app"

export default async function HomePage() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Check if user is logged in
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch problems with their 5W2H plans
  const { data: problems = [] } = await supabase
    .from("problems")
    .select(`
      *,
      w5h2_plans (*)
    `)
    .order("created_at", { ascending: false })

  return <ProblemsApp initialProblems={problems} user={user} />
}
