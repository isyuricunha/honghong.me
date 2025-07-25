'use client'

import type { ListMessagesOutput } from '@/orpc/routers'

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Avatar, AvatarFallback, AvatarImage } from '@tszhong0411/ui/components/avatar'
import { Skeleton } from '@tszhong0411/ui/components/skeleton'
import { getAbbreviation } from '@tszhong0411/utils'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { useFormattedDate } from '@/hooks/use-formatted-date'
import { useSession } from '@/lib/auth-client'
import { orpc } from '@/orpc/client'
import { MessageProvider } from '@/stores/message'
import { getDefaultImage } from '@/utils/get-default-image'

import DeleteButton from './delete-button'
import MessagesLoader from './messages-loader'

type UpdatedDateProps = {
  date: Date
}

type MessageProps = {
  message: ListMessagesOutput['messages'][number]
}

const UpdatedDate = (props: UpdatedDateProps) => {
  const { date } = props
  const formattedDate = useFormattedDate(date, {
    formatOptions: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  })

  if (!formattedDate) return <Skeleton className='h-4 w-24 rounded-md' />

  return <div className='text-muted-foreground text-xs'>{formattedDate}</div>
}

const Messages = () => {
  const { status, data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    orpc.guestbook.list.infiniteOptions({
      input: (pageParam: Date | undefined) => ({ cursor: pageParam }),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      placeholderData: keepPreviousData
    })
  )
  const t = useTranslations()

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage()
  }, [fetchNextPage, hasNextPage, inView])

  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isLoading = status === 'pending' || isFetchingNextPage
  const noMessages = status === 'success' && data.pages[0]?.messages.length === 0

  return (
    <div className='flex flex-col gap-4' data-testid='guestbook-messages-list'>
      {isSuccess &&
        data.pages.map((page) =>
          page.messages.map((message) => <Message key={message.id} message={message} />)
        )}
      {noMessages && (
        <div className='flex min-h-24 items-center justify-center'>
          <p className='text-muted-foreground text-sm'>{t('guestbook.no-messages')}</p>
        </div>
      )}
      {isError && (
        <div className='flex min-h-24 items-center justify-center'>
          <p className='text-muted-foreground text-sm'>{t('guestbook.failed-to-load-messages')}</p>
        </div>
      )}
      {isLoading && <MessagesLoader />}
      <span ref={ref} className='invisible' />
    </div>
  )
}

const Message = (props: MessageProps) => {
  const { message } = props
  const { data: session } = useSession()

  const {
    message: {
      id,
      user: { name, image, id: userId },
      updatedAt,
      body
    }
  } = props

  const isAuthor = session?.user && userId === session.user.id

  const defaultImage = getDefaultImage(userId)

  return (
    <MessageProvider message={message}>
      <div
        className='shadow-xs rounded-lg border p-4 dark:bg-zinc-900/30'
        data-testid={`message-${id}`}
      >
        <div className='mb-3 flex gap-3'>
          <Avatar className='size-10'>
            <AvatarImage src={image ?? defaultImage} alt={name} />
            <AvatarFallback>{getAbbreviation(name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col justify-center gap-px text-sm'>
            <div>{name}</div>
            <UpdatedDate date={updatedAt} />
          </div>
        </div>
        <div className='break-words pl-[52px]'>{body}</div>
        {isAuthor && <DeleteButton />}
      </div>
    </MessageProvider>
  )
}

export default Messages
