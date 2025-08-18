"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  // Development mode: simulate successful login without Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Simulate login validation
    if (email.toString() === "admin@teste.com" && password.toString() === "123456") {
      return { success: true }
    } else {
      return { error: "Credenciais inválidas. Use: admin@teste.com / 123456" }
    }
  }

  // Production mode: use Supabase
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003"}`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function createProblem(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to create problems" }
  }

  const title = formData.get("title")?.toString()
  const description = formData.get("description")?.toString()
  const type = formData.get("type")?.toString()
  const severity = formData.get("severity")?.toString()
  const location = formData.get("location")?.toString()
  const recommendations = formData.get("recommendations")?.toString()

  if (!title || !description || !type || !severity) {
    return { error: "All required fields must be filled" }
  }

  try {
    const { data: problemData, error: problemError } = await supabase
      .from("problems")
      .insert({
        title,
        description,
        type,
        severity,
        location,
        recommendations: recommendations || null,
        user_id: user.id,
      })
      .select("id")
      .single()

    if (problemError) {
      console.error("Problem insert error:", problemError)
      return { error: problemError.message }
    }

    const photoCount = Number.parseInt(formData.get("photo_count")?.toString() || "0")

    if (photoCount > 0) {
      const photoInserts = []

      for (let i = 0; i < photoCount; i++) {
        const photoUrl = formData.get(`photo_${i}`)?.toString()
        const filename = formData.get(`filename_${i}`)?.toString()

        if (photoUrl && filename) {
          photoInserts.push({
            problem_id: problemData.id,
            photo_url: photoUrl,
            filename: filename,
          })
        }
      }

      if (photoInserts.length > 0) {
        const { error: photoError } = await supabase.from("problem_photos").insert(photoInserts)

        if (photoError) {
          console.error("Photo insert error:", photoError)
        }
      }
    }

    revalidatePath("/")
    return { success: "Problem created successfully" }
  } catch (error) {
    console.error("Create problem error:", error)
    return { error: "Failed to create problem. Please try again." }
  }
}

export async function updateProblemStatus(problemId: string, status: "pendente" | "resolvido") {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    const { error } = await supabase
      .from("problems")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", problemId)
      .eq("user_id", user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: "Problem status updated" }
  } catch (error) {
    console.error("Update problem status error:", error)
    return { error: "Failed to update problem status" }
  }
}

export async function saveW5H2Plan(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in" }
  }

  const problemId = formData.get("problemId")?.toString()
  const what = formData.get("what")?.toString()
  const why = formData.get("why")?.toString()
  const when_plan = formData.get("when")?.toString()
  const where_plan = formData.get("where")?.toString()
  const who = formData.get("who")?.toString()
  const how = formData.get("how")?.toString()
  const how_much = formData.get("howMuch")?.toString()

  if (!problemId) {
    return { error: "Problem ID is required" }
  }

  try {
    const { data: existingPlan } = await supabase.from("w5h2_plans").select("id").eq("problem_id", problemId).single()

    if (existingPlan) {
      const { error } = await supabase
        .from("w5h2_plans")
        .update({
          what,
          why,
          when_plan,
          where_plan,
          who,
          how,
          how_much,
          updated_at: new Date().toISOString(),
        })
        .eq("problem_id", problemId)

      if (error) {
        return { error: error.message }
      }
    } else {
      const { error } = await supabase.from("w5h2_plans").insert({
        problem_id: problemId,
        what,
        why,
        when_plan,
        where_plan,
        who,
        how,
        how_much,
      })

      if (error) {
        return { error: error.message }
      }
    }

    revalidatePath("/")
    return { success: "Plan saved successfully" }
  } catch (error) {
    console.error("Save W5H2 plan error:", error)
    return { error: "Failed to save plan" }
  }
}

export async function createW5H2Plan(
  problemId: string,
  planData: {
    what: string
    why: string
    when_plan: string
    where_plan: string
    who: string
    how: string
    how_much: string
  },
) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    const { error } = await supabase.from("w5h2_plans").insert({
      problem_id: problemId,
      ...planData,
    })

    if (error) {
      console.error("Create W5H2 plan error:", error)
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: "Plan created successfully" }
  } catch (error) {
    console.error("Create W5H2 plan error:", error)
    return { error: "Failed to create plan" }
  }
}

export async function updateW5H2Plan(
  planId: string,
  updateData: Partial<{
    what: string
    why: string
    when_plan: string
    where_plan: string
    who: string
    how: string
    how_much: string
  }>,
) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    const { error } = await supabase
      .from("w5h2_plans")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId)

    if (error) {
      console.error("Update W5H2 plan error:", error)
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: "Plan updated successfully" }
  } catch (error) {
    console.error("Update W5H2 plan error:", error)
    return { error: "Failed to update plan" }
  }
}

export async function deleteW5H2Plan(planId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    const { error } = await supabase.from("w5h2_plans").delete().eq("id", planId)

    if (error) {
      console.error("Delete W5H2 plan error:", error)
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: "Plan deleted successfully" }
  } catch (error) {
    console.error("Delete W5H2 plan error:", error)
    return { error: "Failed to delete plan" }
  }
}

export async function getProblems() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  try {
    const { data: problems, error } = await supabase
      .from("problems")
      .select(`
        *,
        problem_photos (
          id,
          photo_url,
          filename
        ),
        w5h2_plans (
          id,
          what,
          why,
          when_plan,
          where_plan,
          who,
          how,
          how_much,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Get problems error:", error)
      return []
    }

    return problems || []
  } catch (error) {
    console.error("Get problems error:", error)
    return []
  }
}

export async function updateProblem(
  problemId: string,
  updateData: {
    title?: string
    description?: string
    type?: string
    severity?: string
    location?: string
    recommendations?: string
  },
) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    const { error } = await supabase
      .from("problems")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", problemId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Update problem error:", error)
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: "Problem updated successfully" }
  } catch (error) {
    console.error("Update problem error:", error)
    return { error: "Failed to update problem. Please try again." }
  }
}

export async function deleteProblem(problemId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in" }
  }

  try {
    const { error: photoError } = await supabase.from("problem_photos").delete().eq("problem_id", problemId)

    if (photoError) {
      console.error("Delete photos error:", photoError)
    }

    const { error: planError } = await supabase.from("w5h2_plans").delete().eq("problem_id", problemId)

    if (planError) {
      console.error("Delete plans error:", planError)
    }

    const { error } = await supabase.from("problems").delete().eq("id", problemId).eq("user_id", user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: "Problem deleted successfully" }
  } catch (error) {
    console.error("Delete problem error:", error)
    return { error: "Failed to delete problem" }
  }
}
