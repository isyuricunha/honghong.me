'use client'

import type { ListMessagesOutput } from '@/orpc/routers'

import { useTranslations } from '@repo/i18n/client'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { getAbbreviation } from '@repo/utils'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { useSession } from '@/hooks/queries/auth.query'
import { useGuestbookMessages } from '@/hooks/queries/guestbook.query'
import { useFormattedDate } from '@/hooks/use-formatted-date'
import { getDefaultImage } from '@/utils/get-default-image'

import DeleteButton from './delete-button'
import MessagesLoader from './messages-loader'

const Messages = () => {
  const { isSuccess, isLoading, isError, data, fetchNextPage, hasNextPage, isFetchingNextPage } = useGuestbookMessages()
  const t = useTranslations()

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage()
  }, [fetchNextPage, hasNextPage, inView])

  const noMessages = isSuccess && data.pages.every((page) => page.messages.length === 0)

  return (
    <div className='flex flex-col gap-4' data-testid='guestbook-messages-list'>
      {isSuccess &&
        data.pages.map((page) => page.messages.map((message) => <Message key={message.id} message={message} />))}
      {(isLoading || isFetchingNextPage) && <MessagesLoader />}
      <span ref={ref} className='invisible' />
      {isError && (
        <div className='flex min-h-24 items-center justify-center'>
          <p className='text-sm text-muted-foreground'>{t('error.failed-to-load-messages')}</p>
        </div>
      )}
      {noMessages && (
        <div className='flex min-h-24 items-center justify-center'>
          <p className='text-sm text-muted-foreground'>{t('guestbook.no-messages')}</p>
        </div>
      )}
    </div>
  )
}

type MessageProps = {
  message: ListMessagesOutput['messages'][number]
}

const Message = (props: MessageProps) => {
  const { message } = props
  const { data: session } = useSession()

  const isAuthor = session?.user && message.userId === session.user.id

  const defaultImage = getDefaultImage(message.userId)

  const formattedDate = useFormattedDate(message.createdAt, {
    formatOptions: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  })

  return (
    <div className='rounded-lg border p-4 shadow-xs dark:bg-zinc-900/30' data-testid={`message-${message.id}`}>
      <div className='mb-3 flex gap-3'>
        <Avatar className='size-10'>
          <AvatarImage src={message.user.image ?? defaultImage} alt={message.user.name} />
          <AvatarFallback>{getAbbreviation(message.user.name)}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col justify-center gap-px text-sm'>
          <div>{message.user.name}</div>
          <div className='text-xs text-muted-foreground'>{formattedDate}</div>
        </div>
      </div>
      <div className='pl-13 break-words'>{message.body}</div>
      {isAuthor && <DeleteButton message={message} />}
    </div>
  )
}

export default Messages
