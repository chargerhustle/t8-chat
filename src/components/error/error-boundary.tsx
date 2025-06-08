"use client"

import { useRouteError, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export function ErrorBoundary() {
  const error = useRouteError() as Error
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate("/")
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">
            {error?.message || "An unexpected error occurred"}
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={handleGoHome}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
              {error?.stack || error?.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
} 