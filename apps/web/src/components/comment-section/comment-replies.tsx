'use client'

import { useTranslations } from '@tszhong0411/i18n/client'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { useCommentContext } from '@/contexts/comment.context'
import { useCommentsContext } from '@/contexts/comments.context'
import { usePostComments } from '@/hooks/queries/post.query'
import { useCommentParams } from '@/hooks/use-comment-params'

import Comment from './comment'
import CommentLoader from './comment-loader'

const CommentReplies = () => {
  const { comment, isOpenReplies, setIsOpenReplies } = useCommentContext()
  const { slug } = useCommentsContext()
  const [params] = useCommentParams()
  const t = useTranslations()

  const { status, data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePostComments(
    (pageParam) => ({
      slug,
      sort: 'oldest',
      parentId: comment.id,
      type: 'replies',
      highlightedCommentId: params.reply ?? undefined,
      cursor: pageParam
    }),
    isOpenReplies
  )

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage()
  }, [fetchNextPage, hasNextPage, inView])

  useEffect(() => {
    if (params.comment === comment.id) setIsOpenReplies(true)
  }, [comment.id, params.comment, setIsOpenReplies])

  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isLoading = status === 'pending' || isFetchingNextPage

  return (
    <>
      {isOpenReplies && (
        <div className='space-y-8 pl-7'>
          {isSuccess &&
            data.pages.map((page) =>
              page.comments.map((reply) => <Comment key={reply.id} comment={reply} />)
            )}
          {isLoading && <CommentLoader />}
          {isError && (
            <div className='flex min-h-20 items-center justify-center'>
              <p className='text-muted-foreground text-sm'>
                {t('blog.comments.failed-to-load-replies')}
              </p>
            </div>
          )}
          <span ref={ref} className='invisible' />
        </div>
      )}
    </>
  )
}

export default CommentReplies
