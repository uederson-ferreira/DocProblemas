"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Photo {
  id: string
  photo_url: string
  filename: string
}

interface PhotoCarouselProps {
  photos: Photo[]
  className?: string
}

export function PhotoCarousel({ photos, className = "" }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center h-48 ${className}`}>
        <p className="text-gray-500">Nenhuma foto disponível</p>
      </div>
    )
  }

  if (photos.length === 1) {
    return (
      <div className={`relative rounded-lg overflow-hidden ${className}`}>
        <Image
          src={photos[0].photo_url || "/placeholder.svg"}
          alt={photos[0].filename}
          width={400}
          height={300}
          className="w-full h-48 object-contain bg-gray-50"
        />
      </div>
    )
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <Image
        src={photos[currentIndex].photo_url || "/placeholder.svg"}
        alt={photos[currentIndex].filename}
        width={400}
        height={300}
        className="w-full h-48 object-contain bg-gray-50"
      />

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={prevPhoto}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={nextPhoto}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Photo indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {photos.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Photo counter */}
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  )
}
