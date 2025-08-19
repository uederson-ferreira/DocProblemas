import { type NextRequest, NextResponse } from "next/server"
import PptxGenJS from "pptxgenjs"

interface Problem {
  id: string
  problem_number: number
  title: string
  description: string
  recommendations?: string
  type: string // Agora suporta múltiplos tipos separados por vírgula
  severity: string
  location: string
  status: "pendente" | "resolvido" // Mudando de resolved para status
  created_at: string
  latitude_gms?: string // Coordenada GMS: "02 30 50 S"
  longitude_gms?: string // Coordenada GMS: "47 44 39 W"
  latitude_decimal?: number // Coordenada decimal: -2.513889
  longitude_decimal?: number // Coordenada decimal: -47.744167
  problem_photos?: Array<{
    id: string
    photo_url: string
    filename: string
  }>
}

const convertImageToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const mimeType = blob.type || "image/jpeg"
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error("Error converting image:", error)
    return ""
  }
}

export async function POST(request: NextRequest) {
  try {
    const { problems }: { problems: Problem[] } = await request.json()

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
    const resolvedProblems = problems.filter((p) => p.status === "resolvido").length
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
      const problemTitle = problem.title || `PROBLEMA #${String(problem.problem_number).padStart(3, "0")}`
      slide.addText(problemTitle, {
        x: 0.5,
        y: 0.2,
        w: 9,
        h: 0.8,
        fontSize: 20,
        bold: true,
        color: problem.status === "resolvido" ? "16A34A" : "DC2626",
      })

      // Left column for text content
      const leftColumnWidth = 4.5
      const rightColumnX = 5.5
      const rightColumnWidth = 4

      // Problem details in left column
      let yPos = 1.0
      
      // Função para renderizar tipos múltiplos
      const renderTypes = (typeString: string) => {
        if (!typeString) return "Não especificado"
        const types = typeString.split(',').map(t => t.trim())
        const typeLabels: { [key: string]: string } = {
          meio_ambiente: "Meio Ambiente",
          saude: "Saúde",
          seguranca: "Segurança",
          outros: "Outros",
        }
        return types.map(t => typeLabels[t] || t).join(', ')
      }
      
      slide.addText([{ text: "Tipo: ", options: { bold: true } }, { text: renderTypes(problem.type) }], {
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
        [{ text: "Status: ", options: { bold: true } }, { text: problem.status === "pendente" ? "Não Resolvido" : "Resolvido" }],
        { x: 0.5, y: yPos, w: leftColumnWidth, h: 0.3, fontSize: 12, color: problem.status === "resolvido" ? "16A34A" : "DC2626" },
      )

      // Adicionar coordenadas se disponíveis
      if (problem.latitude_gms && problem.longitude_gms) {
        yPos += 0.35
        slide.addText([{ text: "Coordenadas: ", options: { bold: true } }, { text: `${problem.latitude_gms}, ${problem.longitude_gms}` }], {
          x: 0.5,
          y: yPos,
          w: leftColumnWidth,
          h: 0.3,
          fontSize: 11,
          color: "22C55E",
        })
        
        // Adicionar coordenadas decimais se disponíveis
        if (problem.latitude_decimal && problem.longitude_decimal) {
          yPos += 0.25
          slide.addText([{ text: "Decimal: ", options: { bold: true } }, { text: `${problem.latitude_decimal.toFixed(6)}°, ${problem.longitude_decimal.toFixed(6)}°` }], {
            x: 0.5,
            y: yPos,
            w: leftColumnWidth,
            h: 0.25,
            fontSize: 10,
            color: "666666",
          })
        }
      }

      yPos += 0.35
      slide.addText("Descrição:", { x: 0.5, y: yPos, w: leftColumnWidth, h: 0.2, fontSize: 14, bold: true })
      yPos += 0.15  // Reduzido gap entre título e texto
      slide.addText(problem.description, { x: 0.5, y: yPos, w: leftColumnWidth, h: 1.0, fontSize: 11, wrap: true })

      yPos += 1.05  // Reduzido espaçamento
      if (problem.recommendations) {
        slide.addText("Recomendações:", { x: 0.5, y: yPos, w: leftColumnWidth, h: 0.2, fontSize: 14, bold: true })
        yPos += 0.15  // Reduzido gap entre título e texto
        slide.addText(problem.recommendations, {
          x: 0.5,
          y: yPos,
          w: leftColumnWidth,
          h: 0.8,  // Reduzido altura para não vazar
          fontSize: 11,
          wrap: true,
        })
      }

      // Add photos in right column if available
      if (problem.problem_photos && problem.problem_photos.length > 0) {
        // Conversão: 8,47cm x 12,14cm = 3.33" x 4.78" (1 polegada = 2.54 cm)
        const photoWidth = 3.33  // 8,47 cm
        const photoHeight = 4.78 // 12,14 cm

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

    // Generate PPTX buffer
    const pptxBuffer = await pptx.write({ outputType: "arraybuffer" })

    // Return the file as response
    const fileName = `relatorio-problemas-${new Date().toISOString().split("T")[0]}.pptx`

    return new NextResponse(pptxBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error generating PPTX:", error)
    return NextResponse.json({ error: "Failed to generate PPTX" }, { status: 500 })
  }
}
