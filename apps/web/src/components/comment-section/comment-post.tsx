'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Button } from '@tszhong0411/ui/components/button'
import { toast } from '@tszhong0411/ui/components/sonner'
import { SendIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useCommentParams } from '@/hooks/use-comment-params'
import { useSession } from '@/lib/auth-client'
import { useORPCInvalidator } from '@/lib/orpc-invalidator'
import { orpc } from '@/orpc/client'
import { useCommentsStore } from '@/stores/comments'

import CommentEditor from './comment-editor'
import UnauthorizedOverlay from './unauthorized-overlay'

const CommentPost = () => {
  const { slug, sort } = useCommentsStore((state) => ({ slug: state.slug, sort: state.sort }))
  const [params] = useCommentParams()
  const [content, setContent] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const { data: session, isPending } = useSession()
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
      onSuccess: () => {
        setContent('')
        toast.success(t('blog.comments.comment-posted'))
      },
      onError: (error) => {
        toast.error(error.message)
      },
      onSettled: async () => {
        await invalidator.comments.invalidateAfterAction({
          slug,
          infiniteCommentsParams
        })
      }
    })
  )

  const submitComment = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    if (!content) {
      toast.error(t('blog.comments.comment-cannot-be-empty'))
      return
    }

    commentsMutation.mutate({
      slug,
      content,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const isAuthenticated = session !== null && !isPending
  const disabled = !isAuthenticated || commentsMutation.isPending

  return (
    <form onSubmit={submitComment}>
      <div className='relative'>
        <CommentEditor
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onModEnter={submitComment}
          placeholder={t('blog.comments.placeholder')}
          disabled={disabled}
          data-testid='comment-textarea-post'
        />
        <Button
          variant='ghost'
          size='icon'
          className='absolute bottom-1.5 right-2 size-7'
          type='submit'
          disabled={disabled || !content}
          aria-label={t('blog.comments.send-comment')}
          aria-disabled={disabled || !content}
          data-testid='comment-submit-button'
        >
          <SendIcon />
        </Button>
        {isAuthenticated ? null : <UnauthorizedOverlay />}
      </div>
    </form>
  )
}

export default CommentPost
