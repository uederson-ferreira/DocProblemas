"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cadastrando...
        </>
      ) : (
        "Cadastrar"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signUp, null)

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/auth/login")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [state?.success, router])

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-orange-500" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Criar conta</h1>
        <p className="text-lg text-gray-600">Cadastre-se para começar</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{state.error}</div>
        )}

        {state?.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {state.success} Redirecionando para o login...
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        </div>

        <SubmitButton />

        <div className="text-center text-gray-600">
          Já tem uma conta?{" "}
          <Link href="/auth/login" className="text-orange-600 hover:underline font-medium">
            Entrar
          </Link>
        </div>
      </form>
    </div>
  )
}
