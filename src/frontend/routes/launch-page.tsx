"use client"

import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { ChatInput } from "@/components/chat/chat-input/chat-input"
import { createMessage } from "@/lib/chat/create-message"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ModelConfig, DEFAULT_MODEL } from "@/ai/models-config"

export default function LaunchChat() {
  const navigate = useNavigate()
  const createThreadMutation = useMutation(api.threads.createThread)
  const [hasInputText, setHasInputText] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const createNewThread = async () => {
    const threadId = crypto.randomUUID()
    
    // Set navigating state to prevent welcome message from showing
    setIsNavigating(true)
    
    // 1. Navigate FIRST (instant feedback)
    navigate(`/chat/${threadId}`)
    
    // 2. Create the thread in the database
    try {
      await createThreadMutation({
        threadId,
        title: "New Thread",
        model: DEFAULT_MODEL
      })
    } catch (error) {
      console.error("Failed to create thread:", error)
    }
  }

  const handleSubmit = async (message: string, model: ModelConfig) => {
    if (!message.trim()) return

    const threadId = crypto.randomUUID()
    
    // Set navigating state to prevent welcome message from showing
    setIsNavigating(true)
    
    // 1. Navigate FIRST (instant feedback)
    navigate(`/chat/${threadId}`)
    
    // 2. Call createMessage with everything (it handles thread creation)
    createMessage({
      newThread: true,        // createMessage will create the thread
      threadId,              
      userContent: message,
      model: model.model,     // Use the selected model from dropdown
      attachments: [],
    }).catch(error => {
      console.error("Failed to create thread:", error)
    })
  }

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 custom-scrollbar">
        <div className="flex h-full flex-col items-center justify-center p-4 pb-[141px]">
          {!hasInputText && !isNavigating && (
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold mb-2">Welcome to AI Web Chat</h1>
              <p className="text-muted-foreground mb-6">
                Start a new conversation or select an existing thread from the sidebar.
              </p>
              <Button onClick={createNewThread} size="lg">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 z-10 w-full px-2">
        <div className="w-full max-w-3xl mx-auto pointer-events-auto">
          <ChatInput 
            onSubmit={handleSubmit} 
            isSubmitting={false} 
            onInputChange={setHasInputText}
          />
        </div>
      </div>
    </div>
  )
}
