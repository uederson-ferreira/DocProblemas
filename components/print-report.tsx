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
      className="flex items-center justify-center gap-2 bg-transparent w-full"
    >
      <Printer className="w-4 h-4" />
      <span className="hidden sm:inline">{isLoading ? "Preparando..." : "Imprimir Relatório"}</span>
      <span className="sm:hidden">{isLoading ? "..." : "Print"}</span>
    </Button>
  )
}

function generatePrintHTML(problems: (Problem & { w5h2_plans: W5H2Plan[]; problem_photos: Photo[] })[]) {
  const currentDate = new Date().toLocaleDateString("pt-BR")
  const currentTime = new Date().toLocaleTimeString("pt-BR")
  const totalProblems = problems.length
  const unresolvedProblems = problems.filter((p) => p.status === "pendente").length
  const resolvedProblems = problems.filter((p) => p.status === "resolvido").length

  const severityColors = {
    critico: "#ef4444",
    alto: "#f97316", 
    medio: "#eab308",
    baixo: "#22c55e",
  }

  const severityLabels = {
    critico: "Crítico",
    alto: "Alto",
    medio: "Médio", 
    baixo: "Baixo",
  }

  const typeLabels = {
    meio_ambiente: "Meio Ambiente",
    saude: "Saúde",
    seguranca: "Segurança",
    outros: "Outros",
  }

  const renderTypes = (typeString: string) => {
    if (!typeString) return "Não especificado"
    const types = typeString.split(',').map(t => t.trim())
    return types.map(t => typeLabels[t as keyof typeof typeLabels] || t).join(', ')
  }

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Problemas de Obra - ${currentDate}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --primary-color: #2563eb;
          --secondary-color: #64748b;
          --success-color: #059669;
          --warning-color: #d97706;
          --danger-color: #dc2626;
          --gray-50: #f8fafc;
          --gray-100: #f1f5f9;
          --gray-200: #e2e8f0;
          --gray-300: #cbd5e1;
          --gray-600: #475569;
          --gray-700: #334155;
          --gray-800: #1e293b;
          --gray-900: #0f172a;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @media print {
          @page { 
            margin: 15mm; 
            size: A4;
          }
          body { 
            font-size: 11px; 
            line-height: 1.4;
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break { 
            page-break-before: always; 
          }
          .no-break { 
            page-break-inside: avoid; 
          }
          .header-main {
            position: relative;
          }
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--gray-800);
          background: white;
          line-height: 1.6;
          font-size: 12px;
        }

        /* Cabeçalho Principal */
        .header-main {
          background: linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%);
          color: white;
          padding: 2rem;
          margin-bottom: 2rem;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }

        .header-main::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transform: translate(50%, -50%);
        }

        .header-content {
          position: relative;
          z-index: 2;
        }

        .header-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          font-weight: 400;
          margin-bottom: 1rem;
        }

        .header-meta {
          display: flex;
          gap: 2rem;
          font-size: 0.95rem;
          opacity: 0.95;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Dashboard de Estatísticas */
        .stats-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .stat-card {
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-total .stat-icon { background: linear-gradient(135deg, var(--primary-color), #1d4ed8); color: white; }
        .stat-pending .stat-icon { background: linear-gradient(135deg, var(--danger-color), #b91c1c); color: white; }
        .stat-resolved .stat-icon { background: linear-gradient(135deg, var(--success-color), #047857); color: white; }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-total .stat-number { color: var(--primary-color); }
        .stat-pending .stat-number { color: var(--danger-color); }
        .stat-resolved .stat-number { color: var(--success-color); }

        .stat-label {
          font-size: 0.9rem;
          color: var(--gray-600);
          font-weight: 500;
        }

        /* Cards de Problemas */
        .problem-card {
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 16px;
          margin: 2rem 0;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .problem-header {
          background: var(--gray-50);
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .problem-title-section {
          flex: 1;
        }

        .problem-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.5rem;
        }

        .problem-number {
          font-size: 0.85rem;
          color: var(--gray-600);
          font-weight: 500;
        }

        .severity-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .problem-meta-grid {
          background: white;
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-100);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .meta-item-grid {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--gray-50);
          border-radius: 8px;
        }

        .meta-icon {
          width: 32px;
          height: 32px;
          background: var(--primary-color);
          color: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .meta-content {
          flex: 1;
        }

        .meta-label {
          font-size: 0.8rem;
          color: var(--gray-600);
          font-weight: 500;
          margin-bottom: 0.2rem;
        }

        .meta-value {
          font-weight: 600;
          color: var(--gray-800);
        }

        /* Coordenadas */
        .coordinates-section {
          margin: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          position: relative;
        }

        .coordinates-section::before {
          content: '🗺️';
          position: absolute;
          top: -8px;
          left: 1rem;
          background: white;
          padding: 0 0.5rem;
          font-size: 1.2rem;
        }

        .coordinates-title {
          font-weight: 600;
          color: var(--success-color);
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .coordinates-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .coordinate-item {
          background: white;
          padding: 0.75rem;
          border-radius: 6px;
          border: 1px solid #bbf7d0;
        }

        /* Conteúdo Principal */
        .problem-content {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
          padding: 1.5rem;
        }

        .content-left {
          min-width: 0;
        }

        .content-right {
          background: var(--gray-50);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .description-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--gray-200);
          margin-bottom: 1.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .description-text {
          color: var(--gray-700);
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.6;
        }

        .recommendations-section {
          background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
        }

        .recommendations-section::before {
          content: '💡';
          position: absolute;
          top: -8px;
          left: 1rem;
          background: white;
          padding: 0 0.5rem;
          font-size: 1.2rem;
        }

        /* Fotos */
        .photos-section {
          margin-top: 1rem;
        }

        .photos-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .photo-item {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--gray-200);
        }

        .photo-item img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          background: var(--gray-100);
        }

        .photo-caption {
          padding: 0.75rem;
          font-size: 0.8rem;
          color: var(--gray-600);
          background: var(--gray-50);
          text-align: center;
          border-top: 1px solid var(--gray-200);
        }

        /* Plano 5W2H */
        .w5h2-section {
          margin: 1.5rem;
          background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid var(--gray-200);
        }

        .w5h2-title {
          text-align: center;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--gray-800);
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .w5h2-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .w5h2-item {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          border: 1px solid var(--gray-200);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .w5h2-label {
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .w5h2-value {
          color: var(--gray-700);
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.5;
        }

        /* Estados vazios */
        .no-problems {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--gray-600);
          background: var(--gray-50);
          border-radius: 16px;
          margin: 2rem 0;
        }

        .no-problems-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* Responsividade para impressão */
        @media print {
          .problem-content {
            grid-template-columns: 1fr;
          }
          
          .content-right {
            margin-top: 1rem;
            background: white !important;
            border: 1px solid var(--gray-200);
          }

          .photos-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .w5h2-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-dashboard {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media screen and (max-width: 768px) {
          .problem-content {
            grid-template-columns: 1fr;
          }
          
          .header-meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .stats-dashboard {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <!-- Cabeçalho Principal -->
      <div class="header-main">
        <div class="header-content">
          <h1 class="header-title">
            <span>📋</span>
            Relatório de Problemas de Obra
          </h1>
          <p class="header-subtitle">Documentação detalhada de problemas de segurança e ambientais</p>
          <div class="header-meta">
            <div class="meta-item">
              <span>📅</span>
              <span>Data: ${currentDate}</span>
            </div>
            <div class="meta-item">
              <span>🕐</span>
              <span>Hora: ${currentTime}</span>
            </div>
            <div class="meta-item">
              <span>📊</span>
              <span>Total de registros: ${totalProblems}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard de Estatísticas -->
      <div class="stats-dashboard">
        <div class="stat-card stat-total">
          <div class="stat-icon">📋</div>
          <div class="stat-number">${totalProblems}</div>
          <div class="stat-label">Total de Problemas</div>
        </div>
        <div class="stat-card stat-pending">
          <div class="stat-icon">⚠️</div>
          <div class="stat-number">${unresolvedProblems}</div>
          <div class="stat-label">Pendentes</div>
        </div>
        <div class="stat-card stat-resolved">
          <div class="stat-icon">✅</div>
          <div class="stat-number">${resolvedProblems}</div>
          <div class="stat-label">Resolvidos</div>
        </div>
      </div>

      <!-- Lista de Problemas -->
      ${
        problems.length === 0
          ? `
            <div class="no-problems">
              <div class="no-problems-icon">📋</div>
              <h3>Nenhum problema registrado</h3>
              <p>Não há problemas cadastrados no sistema no momento.</p>
            </div>
          `
          : problems
              .map(
                (problem, index) => `
          <div class="problem-card no-break">
            <!-- Cabeçalho do Problema -->
            <div class="problem-header">
              <div class="problem-title-section">
                <h2 class="problem-title">${problem.title || `Problema sem título`}</h2>
                <div class="problem-number">#${String(problem.problem_number || index + 1).padStart(3, "0")}</div>
              </div>
              <div class="severity-badge" style="background-color: ${severityColors[problem.severity as keyof typeof severityColors]}">
                ${severityLabels[problem.severity as keyof typeof severityLabels]}
              </div>
            </div>

            <!-- Metadados -->
            <div class="problem-meta-grid">
              <div class="meta-item-grid">
                <div class="meta-icon">🏷️</div>
                <div class="meta-content">
                  <div class="meta-label">Tipo</div>
                  <div class="meta-value">${renderTypes(problem.type)}</div>
                </div>
              </div>
              <div class="meta-item-grid">
                <div class="meta-icon">📊</div>
                <div class="meta-content">
                  <div class="meta-label">Status</div>
                  <div class="meta-value">${problem.status === "pendente" ? "Pendente" : "Resolvido"}</div>
                </div>
              </div>
              <div class="meta-item-grid">
                <div class="meta-icon">📅</div>
                <div class="meta-content">
                  <div class="meta-label">Data de Registro</div>
                  <div class="meta-value">${new Date(problem.created_at).toLocaleDateString("pt-BR")}</div>
                </div>
              </div>
              ${problem.location ? `
              <div class="meta-item-grid">
                <div class="meta-icon">📍</div>
                <div class="meta-content">
                  <div class="meta-label">Local</div>
                  <div class="meta-value">${problem.location}</div>
                </div>
              </div>
              ` : ""}
            </div>

            <!-- Coordenadas -->
            ${(problem as any).latitude_gms && (problem as any).longitude_gms ? `
            <div class="coordinates-section">
              <div class="coordinates-title">Coordenadas Geográficas (SIRGAS 2000)</div>
              <div class="coordinates-grid">
                <div class="coordinate-item">
                  <strong>Latitude:</strong> ${(problem as any).latitude_gms}
                </div>
                <div class="coordinate-item">
                  <strong>Longitude:</strong> ${(problem as any).longitude_gms}
                </div>
              </div>
              ${(problem as any).latitude_decimal && (problem as any).longitude_decimal ? 
                `<div style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--gray-600);">
                  <em>Decimal: ${(problem as any).latitude_decimal.toFixed(6)}°, ${(problem as any).longitude_decimal.toFixed(6)}°</em>
                </div>` : 
                ''
              }
            </div>
            ` : ''}

            <!-- Conteúdo Principal -->
            <div class="problem-content">
              <div class="content-left">
                <!-- Descrição -->
                <div class="description-section">
                  <h3 class="section-title">
                    <span>📝</span>
                    Descrição do Problema
                  </h3>
                  <div class="description-text">${problem.description}</div>
                </div>

                <!-- Recomendações -->
                ${
                  (problem as any).recommendations
                    ? `
                  <div class="recommendations-section">
                    <h3 class="section-title" style="color: var(--primary-color);">
                      <span>💡</span>
                      Recomendações
                    </h3>
                    <div class="description-text">${(problem as any).recommendations}</div>
                  </div>
                `
                    : ""
                }
              </div>

              <!-- Fotos -->
              ${
                problem.problem_photos && problem.problem_photos.length > 0
                  ? `
                <div class="content-right">
                  <h3 class="section-title">
                    <span>📷</span>
                    Evidências Fotográficas
                  </h3>
                  <div class="photos-section">
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
                </div>
              `
                  : ""
              }
            </div>

            <!-- Plano 5W2H -->
            ${
              problem.w5h2_plans && problem.w5h2_plans.length > 0
                ? `
              <div class="w5h2-section">
                <h3 class="w5h2-title">
                  <span>📋</span>
                  Plano de Ação 5W2H
                </h3>
                <div class="w5h2-grid">
                  <div class="w5h2-item">
                    <div class="w5h2-label">O QUE (What)</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].what || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">POR QUE (Why)</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].why || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">QUANDO (When)</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].when_plan || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">ONDE (Where)</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].where_plan || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">QUEM (Who)</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].who || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">COMO (How)</div>
                    <div class="w5h2-value">${problem.w5h2_plans[0].how || "Não preenchido"}</div>
                  </div>
                  <div class="w5h2-item">
                    <div class="w5h2-label">QUANTO (How Much)</div>
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

      <!-- Rodapé -->
      <div style="margin-top: 3rem; padding: 2rem; background: var(--gray-50); border-radius: 12px; text-align: center; border: 1px solid var(--gray-200);">
        <div style="color: var(--gray-600); font-size: 0.9rem; margin-bottom: 0.5rem;">
          📄 Relatório gerado automaticamente pelo sistema
        </div>
        <div style="color: var(--gray-500); font-size: 0.8rem;">
          ${currentDate} às ${currentTime} | Total de ${totalProblems} problema${totalProblems !== 1 ? 's' : ''} documentado${totalProblems !== 1 ? 's' : ''}
        </div>
      </div>
    </body>
    </html>
  `
}