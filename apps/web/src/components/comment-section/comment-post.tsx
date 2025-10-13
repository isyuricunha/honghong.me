'use client'

import { Button } from '@repo/ui/components/button'
import { toast } from '@repo/ui/components/sonner'
import { SendIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { useCommentsContext } from '@/contexts/comments.context'
import { useCreatePostComment } from '@/hooks/queries/post.query'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/lib/auth-client'

import CommentEditor from './comment-editor'
import UnauthenticatedOverlay from './unauthenticated-overlay'

const CommentPost = () => {
  const { slug } = useCommentsContext()
  const [content, setContent] = useState('')
  const [tabsValue, setTabsValue] = useState<'write' | 'preview'>('write')
  const isMounted = useIsMounted()
  const { data: session, isPending: isSessionLoading } = useSession()
  const t = useTranslations()

  const { mutate: createComment, isPending: isCreating } = useCreatePostComment({ slug }, () => {
    setContent('')
    toast.success(t('success.comment-posted'))
    setTabsValue('write')
  })

  const submitComment = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    if (isCreating) return

    if (!content) {
      toast.error(t('error.comment-cannot-be-empty'))
      return
    }

    createComment({
      slug,
      content,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })
  }

  if (!isMounted) {
    return null
  }

  const isAuthenticated = session !== null && !isSessionLoading
  const disabled = !isAuthenticated || isCreating

  return (
    <form onSubmit={submitComment}>
      <div className='relative'>
        <CommentEditor
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
          }}
          tabsValue={tabsValue}
          onTabsValueChange={(value) => {
            setTabsValue(value as 'write' | 'preview')
          }}
          onModEnter={submitComment}
          placeholder={t('blog.comments.placeholder')}
          disabled={disabled}
          data-testid='comment-textarea-post'
        />
        <Button
          variant='ghost'
          size='icon'
          className='absolute right-2 bottom-1.5 size-7'
          type='submit'
          disabled={disabled || !content}
          aria-label={t('blog.comments.send-comment')}
          aria-disabled={disabled || !content}
          data-testid='comment-submit-button'
        >
          <SendIcon />
        </Button>
        {isAuthenticated ? null : <UnauthenticatedOverlay />}
      </div>
    </form>
  )
}

export default CommentPost
