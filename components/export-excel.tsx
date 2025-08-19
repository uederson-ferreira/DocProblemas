"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Download } from "lucide-react"
import type { Problem, W5H2Plan } from "@/lib/supabase/client"
import ExcelJS from 'exceljs'

interface Photo {
  id: string
  photo_url: string
  filename: string
  photo_type?: 'problem' | 'resolution'
}

interface ExportExcelProps {
  problems: (Problem & { 
    w5h2_plans: W5H2Plan[]
    problem_photos?: Photo[]
    photos?: Photo[]
  })[]
}

export function ExportExcel({ problems }: ExportExcelProps) {
  const [isExporting, setIsExporting] = useState(false)

  const downloadImage = async (url: string): Promise<ArrayBuffer | null> => {
    try {
      const response = await fetch(url)
      if (!response.ok) return null
      return await response.arrayBuffer()
    } catch (error) {
      console.error('Erro ao baixar imagem:', error)
      return null
    }
  }

  const getImageDimensions = (buffer: ArrayBuffer): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const blob = new Blob([buffer])
      const url = URL.createObjectURL(blob)
      const img = new Image()
      
      img.onload = () => {
        // Calcular dimensões para caber na célula (máximo 100x100 pixels)
        const maxSize = 100
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        URL.revokeObjectURL(url)
        resolve({ width: Math.round(width), height: Math.round(height) })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ width: 100, height: 100 })
      }
      
      img.src = url
    })
  }

  const exportToExcel = async () => {
    if (problems.length === 0) {
      alert('Nenhum problema para exportar')
      return
    }

    setIsExporting(true)

    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Problemas')

      // Configurar colunas
      worksheet.columns = [
        { header: 'Número', key: 'numero', width: 10 },
        { header: 'Título', key: 'titulo', width: 30 },
        { header: 'Descrição', key: 'descricao', width: 40 },
        { header: 'Tipo', key: 'tipo', width: 15 },
        { header: 'Severidade', key: 'severidade', width: 12 },
        { header: 'Local', key: 'local', width: 25 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Data Criação', key: 'data_criacao', width: 15 },
        { header: 'Foto Antes', key: 'foto_antes', width: 15 },
        { header: 'Foto Depois', key: 'foto_depois', width: 15 },
        { header: 'Recomendações', key: 'recomendacoes', width: 40 },
        { header: 'Coordenadas', key: 'coordenadas', width: 25 }
      ]

      // Estilizar cabeçalho
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      }
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' }

      // Definir altura padrão das linhas (para acomodar imagens)
      worksheet.properties.defaultRowHeight = 80

      let currentRow = 2

      for (const problem of problems) {
        const photos = problem.problem_photos || problem.photos || []
        const problemPhotos = photos.filter(p => !p.photo_type || p.photo_type === 'problem')
        const resolutionPhotos = photos.filter(p => p.photo_type === 'resolution')

        // Dados básicos do problema
        const rowData = {
          numero: (problem as any).problem_number || '',
          titulo: problem.title,
          descricao: problem.description,
          tipo: Array.isArray(problem.type) ? problem.type.join(', ') : problem.type,
          severidade: problem.severity,
          local: problem.location || '',
          status: problem.status === 'resolvido' ? 'Resolvido' : 'Pendente',
          data_criacao: new Date(problem.created_at).toLocaleDateString('pt-BR'),
          foto_antes: problemPhotos.length > 0 ? 'Imagem inserida' : 'Sem foto',
          foto_depois: resolutionPhotos.length > 0 ? 'Imagem inserida' : 'Sem foto',
          recomendacoes: (problem as any).recommendations || '',
          coordenadas: ((problem as any).latitude_gms && (problem as any).longitude_gms) 
            ? `${(problem as any).latitude_gms}, ${(problem as any).longitude_gms}`
            : ''
        }

        // Adicionar dados à linha
        const row = worksheet.addRow(rowData)
        
        // Configurar altura da linha
        row.height = 80

        // Aplicar formatação zebrada
        if (currentRow % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F8F9FA' }
          }
        }

        // Inserir imagem "Antes" (primeira foto do problema)
        if (problemPhotos.length > 0) {
          try {
            const imageBuffer = await downloadImage(problemPhotos[0].photo_url)
            if (imageBuffer) {
              const dimensions = await getImageDimensions(imageBuffer)
              
              const imageId = workbook.addImage({
                buffer: imageBuffer,
                extension: 'jpeg',
              })

              worksheet.addImage(imageId, {
                tl: { col: 8, row: currentRow - 1 }, // Coluna "Foto Antes"
                ext: { width: dimensions.width, height: dimensions.height }
              })
            }
          } catch (error) {
            console.error('Erro ao inserir imagem "antes":', error)
          }
        }

        // Inserir imagem "Depois" (primeira foto de resolução)
        if (resolutionPhotos.length > 0) {
          try {
            const imageBuffer = await downloadImage(resolutionPhotos[0].photo_url)
            if (imageBuffer) {
              const dimensions = await getImageDimensions(imageBuffer)
              
              const imageId = workbook.addImage({
                buffer: imageBuffer,
                extension: 'jpeg',
              })

              worksheet.addImage(imageId, {
                tl: { col: 9, row: currentRow - 1 }, // Coluna "Foto Depois"
                ext: { width: dimensions.width, height: dimensions.height }
              })
            }
          } catch (error) {
            console.error('Erro ao inserir imagem "depois":', error)
          }
        }

        currentRow++
      }

      // Aplicar bordas a todas as células
      for (let row = 1; row <= currentRow; row++) {
        for (let col = 1; col <= 12; col++) {
          const cell = worksheet.getCell(row, col)
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          
          // Alinhamento do texto
          if (row > 1) {
            cell.alignment = { 
              horizontal: 'left', 
              vertical: 'top',
              wrapText: true 
            }
          }
        }
      }

      // Gerar arquivo
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      // Download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `problemas-${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Erro na exportação:', error)
      alert('Erro ao gerar arquivo Excel. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={exportToExcel}
      disabled={isExporting || problems.length === 0}
      className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
    >
      {isExporting ? (
        <>
          <Download className="mr-2 h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Exportando...</span>
          <span className="sm:hidden">...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Exportar Excel</span>
          <span className="sm:hidden">Excel</span>
        </>
      )}
    </Button>
  )
}
