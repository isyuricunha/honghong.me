'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Button } from '@tszhong0411/ui/components/button'
import { toast } from '@tszhong0411/ui/components/sonner'
import { useState } from 'react'

import { useCommentParams } from '@/hooks/use-comment-params'
import { useSession } from '@/lib/auth-client'
import { useORPCInvalidator } from '@/lib/orpc-invalidator'
import { oRPCQueryKeys } from '@/lib/orpc-query-keys'
import { orpc } from '@/orpc/client'
import { useCommentStore } from '@/stores/comment'
import { useCommentsStore } from '@/stores/comments'

import CommentEditor from './comment-editor'
import UnauthorizedOverlay from './unauthorized-overlay'

const CommentReply = () => {
  const [content, setContent] = useState('')
  const { data: session } = useSession()
  const { comment, setIsReplying } = useCommentStore((state) => ({
    comment: state.comment,
    setIsReplying: state.setIsReplying
  }))
  const { slug, sort } = useCommentsStore((state) => ({ slug: state.slug, sort: state.sort }))
  const [params] = useCommentParams()
  const queryClient = useQueryClient()
  const invalidator = useORPCInvalidator()
  const t = useTranslations()

  const infiniteCommentsParams = {
    slug,
    sort,
    type: 'comments' as const,
    highlightedCommentId: params.comment ?? undefined
  }

  const commentsMutation = useMutation(
    orpc.posts.comments.create.mutationOptions({
      onMutate: async () => {
        const queryKey = oRPCQueryKeys.comments.list(infiniteCommentsParams)

        await queryClient.cancelQueries({ queryKey })
        const previousData = queryClient.getQueryData(queryKey)

        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return { pages: [], pageParams: [] }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              comments: page.comments.map((c) =>
                c.id === comment.id ? { ...c, replyCount: c.replyCount + 1 } : c
              )
            }))
          }
        })

        return { previousData }
      },

      onSuccess: () => {
        setIsReplying(false)
        toast.success(t('blog.comments.reply-posted'))
      },

      onError: (error, _, ctx) => {
        if (ctx?.previousData) {
          queryClient.setQueryData(
            oRPCQueryKeys.comments.list(infiniteCommentsParams),
            ctx.previousData
          )
        }
        toast.error(error.message)
      },

      onSettled: async () => {
        await invalidator.comments.invalidateAfterReply({
          slug,
          parentCommentId: comment.id,
          mainCommentsParams: infiniteCommentsParams,
          replyHighlightedId: params.reply ?? undefined
        })
      }
    })
  )

  const submitCommentReply = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    if (!content) {
      toast.error(t('blog.comments.reply-cannot-be-empty'))
      return
    }

    commentsMutation.mutate({
      slug,
      content,
      parentId: comment.id,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })
  }

  const isAuthenticated = session !== null
  const disabled = !isAuthenticated || commentsMutation.isPending

  return (
    <form onSubmit={submitCommentReply}>
      <div className='relative'>
        <CommentEditor
          onChange={(e) => setContent(e.target.value)}
          onModEnter={submitCommentReply}
          onEscape={() => setIsReplying(false)}
          placeholder={t('blog.comments.reply-to-comment')}
          disabled={disabled}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- Autofocus is necessary because user is replying to a comment
          autoFocus
          data-testid='comment-textarea-reply'
        />
        {isAuthenticated ? null : <UnauthorizedOverlay />}
      </div>
      <div className='mt-2 space-x-1'>
        <Button
          variant='secondary'
          className='h-8 px-2 text-xs font-medium'
          type='submit'
          disabled={disabled || !content}
          aria-disabled={disabled || !content}
          data-testid='comment-submit-reply-button'
        >
          {t('blog.comments.reply')}
        </Button>
        <Button
          variant='secondary'
          className='h-8 px-2 text-xs font-medium'
          onClick={() => setIsReplying(false)}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}

export default CommentReply
