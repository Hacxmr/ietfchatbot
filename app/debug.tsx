"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function DebugPage() {
  const [clickCount, setClickCount] = useState(0)

  const handleClick = () => {
    console.log("Button clicked!")
    setClickCount(prev => prev + 1)
    alert(`Button clicked ${clickCount + 1} times`)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <p className="mb-4">Click count: {clickCount}</p>
      
      {/* Simple HTML button for comparison */}
      <button 
        onClick={handleClick}
        className="mr-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        HTML Button
      </button>
      
      {/* UI Button component */}
      <Button onClick={handleClick}>
        UI Button Component
      </Button>
    </div>
  )
}
