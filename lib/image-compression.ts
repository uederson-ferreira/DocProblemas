/**
 * Utilitários para compressão de imagens no navegador
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeBytes?: number
  outputFormat?: 'jpeg' | 'webp' | 'png'
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Comprime uma imagem reduzindo qualidade e/ou dimensões
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    maxSizeBytes = 5 * 1024 * 1024, // 5MB
    outputFormat = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Não foi possível criar contexto do canvas'))
      return
    }

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      // Configurar canvas
      canvas.width = width
      canvas.height = height

      // Desenhar imagem redimensionada
      ctx.fillStyle = '#FFFFFF' // Fundo branco para JPEGs
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Converter para blob com qualidade especificada
      const mimeType = outputFormat === 'png' ? 'image/png' : 
                      outputFormat === 'webp' ? 'image/webp' : 'image/jpeg'
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha na compressão da imagem'))
            return
          }

          // Criar novo arquivo
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, `.${outputFormat === 'jpeg' ? 'jpg' : outputFormat}`),
            { type: blob.type }
          )

          const result: CompressionResult = {
            file: compressedFile,
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: Math.round((1 - blob.size / file.size) * 100)
          }

          resolve(result)
        },
        mimeType,
        outputFormat === 'png' ? undefined : quality
      )
    }

    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem para compressão'))
    }

    // Carregar imagem
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Verifica se uma imagem precisa ser comprimida
 */
export function needsCompression(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
  return file.size > maxSize
}

/**
 * Comprime uma imagem se necessário
 */
export async function compressIfNeeded(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const maxSize = options.maxSizeBytes || 10 * 1024 * 1024 // 10MB

  if (!needsCompression(file, maxSize)) {
    // Não precisa comprimir, retorna o arquivo original
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0
    }
  }

  // Comprime a imagem
  return compressImage(file, options)
}

/**
 * Formata tamanho de arquivo em formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
