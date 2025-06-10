import { useState, useRef, useCallback } from 'react'

interface UseScrollToBottomOptions {
  threshold?: number
}

export function useScrollToBottom(options: UseScrollToBottomOptions = {}) {
  const { threshold = 10 } = options
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const listenerAttachedRef = useRef(false)

  // Check if user is at the bottom of the scroll container
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold
    setShowScrollToBottom(!isAtBottom)
  }, [threshold])

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [])

  // Enhanced ref callback that sets up the scroll listener
  const scrollContainerRefCallback = useCallback((node: HTMLDivElement | null) => {
    // Clean up previous listener
    if (scrollContainerRef.current && listenerAttachedRef.current) {
      scrollContainerRef.current.removeEventListener('scroll', checkScrollPosition)
      listenerAttachedRef.current = false
    }

    // Set the new ref
    scrollContainerRef.current = node

    // Set up new listener
    if (node) {
      node.addEventListener('scroll', checkScrollPosition, { passive: true })
      listenerAttachedRef.current = true
      // Check initial position
      checkScrollPosition()
    }
  }, [checkScrollPosition])

  // Function to manually trigger scroll position check (for when messages change)
  const updateScrollPosition = useCallback(() => {
    checkScrollPosition()
  }, [checkScrollPosition])

  return {
    showScrollToBottom,
    scrollToBottom,
    scrollContainerRef: scrollContainerRefCallback,
    messagesEndRef,
    updateScrollPosition,
  }
} 