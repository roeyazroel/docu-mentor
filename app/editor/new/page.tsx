"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewDocument() {
  const router = useRouter()

  useEffect(() => {
    // Generate a random document ID and redirect to it
    const newDocId = Math.random().toString(36).substring(2, 10)
    router.push(`/editor/${newDocId}`)
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p>Creating new document...</p>
      </div>
    </div>
  )
}
