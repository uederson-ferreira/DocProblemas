"use client"

import { useState } from "react"
import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Problem {
  id: string
  problem_number: number
  title: string
  description: string
  recommendations?: string
  type: string
  severity: string
  location: string
  resolved: boolean
  created_at: string
  problem_photos?: Array<{
    id: string
    photo_url: string
    filename: string
  }>
}

interface ExportPPTXProps {
  problems: Problem[]
}

export function ExportPPTX({ problems }: ExportPPTXProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePPTX = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/export-pptx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ problems }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PPTX")
      }

      // Download the file
      const blob = await response.blob()
      const fileName = `relatorio-problemas-${new Date().toISOString().split("T")[0]}.pptx`

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error generating PPTX:", error)
      alert("Erro ao gerar apresentação. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={generatePPTX}
      disabled={isGenerating || problems.length === 0}
      className="bg-orange-600 hover:bg-orange-700 text-white"
    >
      {isGenerating ? (
        <>
          <Download className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Exportar PowerPoint
        </>
      )}
    </Button>
  )
}
