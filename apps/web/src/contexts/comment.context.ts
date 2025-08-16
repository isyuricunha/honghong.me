import type { ListCommentsOutput } from '@/orpc/routers'

import { createContext, use } from 'react'

export type CommentContextValue = {
  isEditing: boolean
  isReplying: boolean
  isOpenReplies: boolean
  setIsEditing: (value: boolean) => void
  setIsReplying: (value: boolean) => void
  setIsOpenReplies: (value: boolean) => void
  slug: string
  comment: ListCommentsOutput['comments'][number]
}

const CommentContext = createContext<CommentContextValue | null>(null)
CommentContext.displayName = 'CommentContext'

export const useCommentContext = (): CommentContextValue => {
  const context = use(CommentContext)

  if (!context) {
    throw new Error('useCommentContext must be used within a CommentProvider')
  }

  return context
}

export const CommentProvider = CommentContext.Provider
