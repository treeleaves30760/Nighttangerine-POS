"use client"

import * as React from "react"
import { Maximize, Minimize } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFullscreen}
      aria-label="Toggle fullscreen"
    >
      <Maximize className="h-[1.2rem] w-[1.2rem] scale-100 transition-all data-[fullscreen=true]:scale-0" data-fullscreen={isFullscreen} />
      <Minimize className="absolute h-[1.2rem] w-[1.2rem] scale-0 transition-all data-[fullscreen=true]:scale-100" data-fullscreen={isFullscreen} />
      <span className="sr-only">Toggle fullscreen</span>
    </Button>
  )
}