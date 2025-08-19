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
  const cookieStore = await cookies()
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

  const cookieStore = await cookies()
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
  const cookieStore = await cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function createProblem(prevState: any, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    const title = formData.get("title")?.toString()
    const description = formData.get("description")?.toString()
    const type = formData.getAll("type") // Mudança: getAll em vez de get
    const severity = formData.get("severity")?.toString()
    const location = formData.get("location")?.toString()
    const recommendations = formData.get("recommendations")?.toString()
    const latitude_gms = formData.get("latitude_gms")?.toString()
    const longitude_gms = formData.get("longitude_gms")?.toString()

    if (!title || !description || !type || !severity || !location) {
      return { error: "Missing required fields" }
    }

    // Converter array de tipos para string separada por vírgula
    let typeString = type
    if (Array.isArray(type)) {
      typeString = type.join(',')
    }

    const { data: problemData, error: problemError } = await supabase
      .from("problems")
      .insert({
        title,
        description,
        type: typeString,
        severity,
        location,
        recommendations: recommendations || null,
        latitude_gms: latitude_gms || null,
        longitude_gms: longitude_gms || null,
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
    return { 
      success: "Problem created successfully",
      problem: {
        id: problemData.id,
        title,
        description,
        type: typeString,
        severity,
        location,
        status: "pendente" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
        problem_number: 0, // Será preenchido pelo banco
        recommendations: recommendations || null,
        latitude_gms: latitude_gms || null,
        longitude_gms: longitude_gms || null,
        latitude_decimal: null,
        longitude_decimal: null,
        problem_photos: photoCount > 0 ? Array.from({ length: photoCount }, (_, i) => ({
          id: `temp-${i}`,
          filename: formData.get(`filename_${i}`)?.toString() || "",
          photo_url: formData.get(`photo_${i}`)?.toString() || "",
        })) : [],
        w5h2_plans: []
      }
    }
  } catch (error) {
    console.error("Create problem error:", error)
    return { error: "Failed to create problem. Please try again." }
  }
}

export async function updateProblemStatus(problemId: string, status: "pendente" | "resolvido") {
  const cookieStore = await cookies()
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
  const cookieStore = await cookies()
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
  const cookieStore = await cookies()
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
  const cookieStore = await cookies()
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
  const cookieStore = await cookies()
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
  const cookieStore = await cookies()
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
    latitude_gms?: string
    longitude_gms?: string
    photos?: Array<{
      url: string
      filename: string
      photo_type?: 'problem' | 'resolution'
    }>
  },
) {
  const cookieStore = await cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    // Converter array de tipos para string separada por vírgula se necessário
    let typeString = updateData.type
    if (Array.isArray(updateData.type)) {
      typeString = updateData.type.join(',')
    }

    const { error } = await supabase
      .from("problems")
      .update({
        ...updateData,
        type: typeString,
        updated_at: new Date().toISOString(),
      })
      .eq("id", problemId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Update problem error:", error)
      return { error: error.message }
    }

    // Atualizar fotos se fornecidas
    if (updateData.photos) {
      // Primeiro, remover fotos existentes do tipo especificado
      const photoType = updateData.photos[0]?.photo_type || 'problem'
      await supabase
        .from("problem_photos")
        .delete()
        .eq("problem_id", problemId)
        .eq("photo_type", photoType)

      // Inserir novas fotos
      if (updateData.photos.length > 0) {
        const photoInserts = updateData.photos.map(photo => ({
          problem_id: problemId,
          photo_url: photo.url,
          filename: photo.filename,
          photo_type: photo.photo_type || 'problem'
        }))

        const { error: photoError } = await supabase
          .from("problem_photos")
          .insert(photoInserts)

        if (photoError) {
          console.error("Photo update error:", photoError)
          // Não falhar a operação por erro de foto
        }
      }
    }

    revalidatePath("/")
    return { success: "Problem updated successfully" }
  } catch (error) {
    console.error("Update problem error:", error)
    return { error: "Failed to update problem. Please try again." }
  }
}

export async function resolveProblem(
  problemId: string,
  resolutionData: {
    resolutionNotes: string
    resolutionPhotos?: Array<{
      url: string
      filename: string
    }>
  }
) {
  const cookieStore = await cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    // Atualizar status do problema
    const { error: updateError } = await supabase
      .from("problems")
      .update({
        status: "resolvido",
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionData.resolutionNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", problemId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Resolve problem error:", updateError)
      return { error: updateError.message }
    }

    // Adicionar fotos de resolução se fornecidas
    if (resolutionData.resolutionPhotos && resolutionData.resolutionPhotos.length > 0) {
      const photoInserts = resolutionData.resolutionPhotos.map(photo => ({
        problem_id: problemId,
        photo_url: photo.url,
        filename: photo.filename,
        photo_type: 'resolution' as const
      }))

      const { error: photoError } = await supabase
        .from("problem_photos")
        .insert(photoInserts)

      if (photoError) {
        console.error("Resolution photo error:", photoError)
        // Não falhar a operação por erro de foto
      }
    }

    revalidatePath("/")
    return { success: "Problem resolved successfully" }
  } catch (error) {
    console.error("Resolve problem error:", error)
    return { error: "Failed to resolve problem. Please try again." }
  }
}

export async function updateProblemPhotos(
  problemId: string,
  photos: Array<{
    url: string
    filename: string
    photo_type: 'problem' | 'resolution'
  }>
) {
  const cookieStore = await cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "User not authenticated" }
  }

  try {
    // Verificar se o usuário possui o problema
    const { data: problem } = await supabase
      .from("problems")
      .select("id")
      .eq("id", problemId)
      .eq("user_id", user.id)
      .single()

    if (!problem) {
      return { error: "Problem not found or you don't have permission" }
    }

    // Remover fotos existentes do tipo especificado
    const photoType = photos[0]?.photo_type
    if (photoType) {
      await supabase
        .from("problem_photos")
        .delete()
        .eq("problem_id", problemId)
        .eq("photo_type", photoType)
    }

    // Inserir novas fotos
    if (photos.length > 0) {
      const photoInserts = photos.map(photo => ({
        problem_id: problemId,
        photo_url: photo.url,
        filename: photo.filename,
        photo_type: photo.photo_type
      }))

      const { error: photoError } = await supabase
        .from("problem_photos")
        .insert(photoInserts)

      if (photoError) {
        console.error("Photo update error:", photoError)
        return { error: photoError.message }
      }
    }

    revalidatePath("/")
    return { success: "Photos updated successfully" }
  } catch (error) {
    console.error("Update photos error:", error)
    return { error: "Failed to update photos. Please try again." }
  }
}

export async function deleteProblem(problemId: string) {
  const cookieStore = await cookies()
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
