"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useState } from "react"
import type { Problem, W5H2Plan, Photo } from "@/lib/supabase/client"

interface PrintReportProps {
  problems: (Problem & { w5h2_plans: W5H2Plan[]; problem_photos: Photo[] })[]
}

export function PrintReport({ problems }: PrintReportProps) {
  const [isLoading, setIsLoading] = useState(false)

  const imageToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        try {
          const dataURL = canvas.toDataURL("image/jpeg", 0.8)
          resolve(dataURL)
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = url
    })
  }

  const processImagesForPrint = async (problems: (Problem & { w5h2_plans: W5H2Plan[]; problem_photos: Photo[] })[]) => {
    const processedProblems = []

    for (const problem of problems) {
      const processedPhotos = []

      if (problem.problem_photos && problem.problem_photos.length > 0) {
        for (const photo of problem.problem_photos) {
          try {
            const base64Image = await imageToBase64(photo.photo_url)
            processedPhotos.push({
              ...photo,
              photo_url: base64Image,
            })
          } catch (error) {
            console.error(`Erro ao processar imagem ${photo.filename}:`, error)
            // Manter a URL original se falhar
            processedPhotos.push(photo)
          }
        }
      }

      processedProblems.push({
        ...problem,
        problem_photos: processedPhotos,
      })
    }

    return processedProblems
  }

  const handlePrint = async () => {
    setIsLoading(true)

    try {
      const processedProblems = await processImagesForPrint(problems)
      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      const printContent = generatePrintHTML(processedProblems)

      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()

      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      alert("Erro ao gerar relatório. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      disabled={isLoading}
      className="flex items-center gap-2 bg-transparent"
    >
      <Printer className="w-4 h-4" />
      {isLoading ? "Preparando..." : "Imprimir Relatório"}
    </Button>
  )
}

function generatePrintHTML(problems: (Problem & { w5h2_plans: W5H2Plan[]; problem_photos: Photo[] })[]) {
  const currentDate = new Date().toLocaleDateString("pt-BR")
  const totalProblems = problems.length
  const unresolvedProblems = problems.filter((p) => p.status === "pendente").length
  const resolvedProblems = problems.filter((p) => p.status === "resolvido").length

  const severityColors = {
    critico: "#dc2626",
    alto: "#ea580c",
    medio: "#d97706",
    baixo: "#65a30d",
  }

  const severityLabels = {
    critico: "Crítico",
    alto: "Alto",
    medio: "Médio",
    baixo: "Baixo",
  }

  const typeLabels = {
    seguranca: "Segurança",
    ambiental: "Ambiental",
    infraestrutura: "Infraestrutura",
    qualidade: "Qualidade",
    outros: "Outros",
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Problemas - ${currentDate}</title>
      <style>
        @media print {
          @page { margin: 1cm; }
          body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
        }
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { margin: 0; color: #333; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
        .stat { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #333; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        .problem { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; page-break-inside: avoid; }
        .problem-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .problem-title { font-weight: bold; font-size: 14px; }
        .severity-badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 11px; font-weight: bold; }
        .problem-meta { display: flex; gap: 20px; margin: 10px 0; font-size: 11px; color: #666; }
        .problem-description { margin: 10px 0; }
        .photos-section { margin: 15px 0; }
        .photos-title { font-weight: bold; margin-bottom: 10px; color: #333; }
        .photos-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 15px; }
        .photo-item { text-align: center; }
        .photo-item img { 
          max-width: 100%; 
          height: 150px; 
          object-fit: cover; 
          border: 1px solid #ddd; 
          border-radius: 4px;
        }
        .photo-caption { font-size: 10px; color: #666; margin-top: 5px; }
        .w5h2-section { margin-top: 15px; padding: 10px; background: #f9f9f9; border-radius: 4px; }
        .w5h2-title { font-weight: bold; margin-bottom: 10px; color: #333; }
        .w5h2-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .w5h2-item { margin-bottom: 8px; }
        .w5h2-label { font-weight: bold; color: #555; font-size: 11px; }
        .w5h2-value { margin-top: 2px; font-size: 11px; }
        .no-problems { text-align: center; padding: 40px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 Relatório de Problemas de Obra</h1>
        <p>Documentação de problemas de segurança e ambientais</p>
        <p>Data de geração: ${currentDate}</p>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-number">${totalProblems}</div>
          <div class="stat-label">Total de Problemas</div>
        </div>
        <div class="stat">
          <div class="stat-number" style="color: #dc2626;">${unresolvedProblems}</div>
          <div class="stat-label">Não Resolvidos</div>
        </div>
        <div class="stat">
          <div class="stat-number" style="color: #16a34a;">${resolvedProblems}</div>
          <div class="stat-label">Resolvidos</div>
        </div>
      </div>

      ${
        problems.length === 0
          ? '<div class="no-problems">Nenhum problema registrado</div>'
          : problems
              .map(
                (problem) => `
          <div class="problem">
            <div class="problem-header">
              <div class="problem-title">Problema #${String(problem.problem_number || 1).padStart(3, "0")}</div>
              <div class="severity-badge" style="background-color: ${severityColors[problem.severity as keyof typeof severityColors]}">
                ${severityLabels[problem.severity as keyof typeof severityLabels]}
              </div>
            </div>
            
            <div class="problem-meta">
              <div><strong>Tipo:</strong> ${typeLabels[problem.type as keyof typeof typeLabels]}</div>
              <div><strong>Status:</strong> ${problem.status === "pendente" ? "Não Resolvido" : "Resolvido"}</div>
              <div><strong>Data:</strong> ${new Date(problem.created_at).toLocaleDateString("pt-BR")}</div>
              ${problem.location ? `<div><strong>Local:</strong> ${problem.location}</div>` : ""}
            </div>
            
            <div class="problem-description">
              <strong>Descrição:</strong><br>
              ${problem.description}
            </div>

            ${
              problem.problem_photos && problem.problem_photos.length > 0
                ? `
              <div class="photos-section">
                <div class="photos-title">📷 Fotos do Problema</div>
                <div class="photos-grid">
                  ${problem.problem_photos
                    .map(
                      (photo) => `
                    <div class="photo-item">
                      <img src="${photo.photo_url}" alt="${photo.filename}" />
                      <div class="photo-caption">${photo.filename}</div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

            ${
              problem.w5h2_plans && problem.w5h2_plans.length > 0
                ? `
              <div class="w5h2-section">
                <div class="w5h2-title">📋 Plano de Ação 5W2H</div>
                <div class="w5h2-grid">
                  <div class="w5h2-item">
                    <div class="w5h2-label">O QUE (What):</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].what || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">POR QUE (Why):</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].why || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">QUANDO (When):</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].when_plan || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">ONDE (Where):</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].where_plan || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">QUEM (Who):</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].who || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">COMO (How):</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].how || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">QUANTO (How Much):</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].how_much || "Não preenchido"}</div>
                  </div>
                </div>
              </div>
            `
                : ""
            }
          </div>
        `,
              )
              .join("")
      }
    </body>
    </html>
  `
}
