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

  const convertImageToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error("Error converting image:", error)
      return ""
    }
  }

  const generatePPTX = async () => {
    setIsGenerating(true)

    try {
      // Import PptxGenJS dynamically
      const PptxGenJS = (await import("pptxgenjs")).default
      const pptx = new PptxGenJS()

      // Title slide
      const titleSlide = pptx.addSlide()
      titleSlide.addText("Relatório de Problemas de Obra", {
        x: 1,
        y: 2,
        w: 8,
        h: 1.5,
        fontSize: 32,
        bold: true,
        align: "center",
        color: "363636",
      })

      titleSlide.addText(
        `Documentação de problemas de segurança e ambientais\nData de geração: ${new Date().toLocaleDateString("pt-BR")}`,
        {
          x: 1,
          y: 4,
          w: 8,
          h: 1,
          fontSize: 16,
          align: "center",
          color: "666666",
        },
      )

      // Statistics slide
      const statsSlide = pptx.addSlide()
      const totalProblems = problems.length
      const resolvedProblems = problems.filter((p) => p.resolved).length
      const pendingProblems = totalProblems - resolvedProblems

      statsSlide.addText("Estatísticas Gerais", {
        x: 1,
        y: 0.5,
        w: 8,
        h: 1,
        fontSize: 24,
        bold: true,
        color: "363636",
      })

      statsSlide.addText(
        [
          { text: `Total de Problemas: ${totalProblems}`, options: { fontSize: 18, color: "363636" } },
          { text: `Não Resolvidos: ${pendingProblems}`, options: { fontSize: 18, color: "DC2626" } },
          { text: `Resolvidos: ${resolvedProblems}`, options: { fontSize: 18, color: "16A34A" } },
        ],
        {
          x: 1,
          y: 2,
          w: 8,
          h: 3,
          fontSize: 18,
        },
      )

      // Problem slides
      for (const problem of problems) {
        const slide = pptx.addSlide()

        // Problem title
        slide.addText(`PROBLEMA #${String(problem.problem_number).padStart(3, "0")}`, {
          x: 0.5,
          y: 0.2,
          w: 9,
          h: 0.8,
          fontSize: 20,
          bold: true,
          color: problem.resolved ? "16A34A" : "DC2626",
        })

        // Left column for text content
        const leftColumnWidth = 4.5
        const rightColumnX = 5.5
        const rightColumnWidth = 4

        // Problem details in left column
        let yPos = 1.0
        slide.addText([{ text: "Tipo: ", options: { bold: true } }, { text: problem.type }], {
          x: 0.5,
          y: yPos,
          w: leftColumnWidth,
          h: 0.3,
          fontSize: 12,
        })

        yPos += 0.35
        slide.addText([{ text: "Local: ", options: { bold: true } }, { text: problem.location }], {
          x: 0.5,
          y: yPos,
          w: leftColumnWidth,
          h: 0.3,
          fontSize: 12,
        })

        yPos += 0.35
        slide.addText([{ text: "Severidade: ", options: { bold: true } }, { text: problem.severity }], {
          x: 0.5,
          y: yPos,
          w: leftColumnWidth,
          h: 0.3,
          fontSize: 12,
        })

        yPos += 0.35
        slide.addText(
          [{ text: "Status: ", options: { bold: true } }, { text: problem.resolved ? "Resolvido" : "Não Resolvido" }],
          { x: 0.5, y: yPos, w: leftColumnWidth, h: 0.3, fontSize: 12, color: problem.resolved ? "16A34A" : "DC2626" },
        )

        yPos += 0.55
        slide.addText("Descrição:", { x: 0.5, y: yPos, w: leftColumnWidth, h: 0.3, fontSize: 14, bold: true })
        yPos += 0.3
        slide.addText(problem.description, { x: 0.5, y: yPos, w: leftColumnWidth, h: 1.2, fontSize: 11, wrap: true })

        yPos += 1.4
        if (problem.recommendations) {
          slide.addText("Recomendações:", { x: 0.5, y: yPos, w: leftColumnWidth, h: 0.3, fontSize: 14, bold: true })
          yPos += 0.3
          slide.addText(problem.recommendations, {
            x: 0.5,
            y: yPos,
            w: leftColumnWidth,
            h: 1.0,
            fontSize: 11,
            wrap: true,
          })
        }

        // Add photos in right column if available
        if (problem.problem_photos && problem.problem_photos.length > 0) {
          const photoWidth = rightColumnWidth - 0.2
          const photoHeight = 3.0

          // Use the first photo as main image, occupying most of the right column
          const mainPhoto = problem.problem_photos[0]

          try {
            const base64Image = await convertImageToBase64(mainPhoto.photo_url)
            if (base64Image) {
              slide.addImage({
                data: base64Image,
                x: rightColumnX,
                y: 1.0,
                w: photoWidth,
                h: photoHeight,
                sizing: { type: "contain", w: photoWidth, h: photoHeight },
              })
            }
          } catch (error) {
            console.error("Error adding image to slide:", error)
            slide.addText(`[Foto: ${mainPhoto.filename}]`, {
              x: rightColumnX,
              y: 2.5,
              w: photoWidth,
              h: 0.3,
              fontSize: 10,
              align: "center",
              color: "999999",
            })
          }

          // If there are additional photos, add them smaller below the main photo
          if (problem.problem_photos.length > 1) {
            const smallPhotoWidth = (photoWidth - 0.2) / 2
            const smallPhotoHeight = 1.5
            const startY = 4.2

            for (let i = 1; i < Math.min(problem.problem_photos.length, 3); i++) {
              const photo = problem.problem_photos[i]
              const col = (i - 1) % 2
              const x = rightColumnX + col * (smallPhotoWidth + 0.1)

              try {
                const base64Image = await convertImageToBase64(photo.photo_url)
                if (base64Image) {
                  slide.addImage({
                    data: base64Image,
                    x: x,
                    y: startY,
                    w: smallPhotoWidth,
                    h: smallPhotoHeight,
                    sizing: { type: "contain", w: smallPhotoWidth, h: smallPhotoHeight },
                  })
                }
              } catch (error) {
                console.error("Error adding additional image to slide:", error)
              }
            }
          }
        }
      }

      // Generate and download
      const fileName = `relatorio-problemas-${new Date().toISOString().split("T")[0]}.pptx`
      await pptx.writeFile({ fileName })
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
