'use client'

import type { ListSessionsOutput } from '@/orpc/routers'

import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card } from '@repo/ui/components/card'
import { toast } from '@repo/ui/components/sonner'
import Bowser from 'bowser'
import { InfoIcon, MonitorIcon, SmartphoneIcon, TabletIcon, TvIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useListSessions, useRevokeSession } from '@/hooks/queries/auth.query'
import { useFormattedDate } from '@/hooks/use-formatted-date'

import Tip from '../tip'

import ActiveSessionsSkeleton from './active-sessions-skeleton'

const ActiveSessions = () => {
  const t = useTranslations()
  const { isSuccess, isLoading, isError, data } = useListSessions()

  const sortedSessions =
    isSuccess &&
    data.sessions.length > 0 &&
    data.sessions.toSorted((a, b) => {
      if (a.isCurrentSession !== b.isCurrentSession) {
        return a.isCurrentSession ? -1 : 1
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })

  return (
    <div className='space-y-6'>
      <h2 className='text-lg font-semibold'>{t('account.active-sessions')}</h2>
      {isLoading && <ActiveSessionsSkeleton />}
      {isError && <div>{t('error.something-went-wrong')}</div>}
      {sortedSessions && (
        <div className='space-y-4'>
          {sortedSessions.map((session) => (
            <Session key={session.id} session={session} />
          ))}
        </div>
      )}
      {sortedSessions && sortedSessions.length === 0 && (
        <Card className='py-12 text-center'>{t('account.no-active-sessions')}</Card>
      )}
    </div>
  )
}

type SessionProps = {
  session: ListSessionsOutput['sessions'][number]
}

const PLATFORM_ICONS = {
  desktop: MonitorIcon,
  mobile: SmartphoneIcon,
  tablet: TabletIcon,
  tv: TvIcon
}

const Session = (props: SessionProps) => {
  const { session } = props
  const t = useTranslations()

  const { browser, os, platform } = Bowser.parse(session.userAgent ?? '')

  const platformType = (platform.type ?? 'desktop') as keyof typeof PLATFORM_ICONS
  const PlatformIcon = PLATFORM_ICONS[platformType]

  const browserName = browser.name ?? t('common.unknown')
  const browserVersion = browser.version ? `v${browser.version}` : ''
  const osName = os.name ?? t('common.unknown')

  const ipAddress = session.ipAddress ?? t('common.unknown')
  const lastActive = useFormattedDate(session.createdAt, {
    formatOptions: {
      dateStyle: 'medium',
      timeStyle: 'short'
    }
  })

  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession(() => {
    toast.success(t('account.session-revoked-successfully'))
  })

  const handleRevoke = () => {
    if (isRevoking) return

    revokeSession({ token: session.token })
  }

  return (
    <Card className='p-4 sm:p-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:justify-between'>
        <div className='flex gap-4'>
          <div className='flex size-12 items-center justify-center rounded-full bg-secondary'>
            <PlatformIcon aria-hidden className='size-6' />
          </div>
          <div className='space-y-1'>
            <div className='flex h-12 items-center gap-4 font-semibold'>
              <span className='text-lg'>{osName}</span>{' '}
              {session.isCurrentSession && <Badge>{t('account.this-device')}</Badge>}
            </div>
            <div className='space-y-1 text-sm'>
              <div>
                {browserName} {browserVersion && <span className='text-muted-foreground'>{browserVersion}</span>}
              </div>
              <div className='flex items-center gap-1.5'>
                {ipAddress}{' '}
                {session.location && (
                  <>
                    <span className='text-muted-foreground'>{session.location}</span>
                    <Tip content='Location may not be accurate'>
                      <InfoIcon className='size-4 text-muted-foreground' />
                    </Tip>
                  </>
                )}
              </div>
              <div>{lastActive}</div>
            </div>
          </div>
        </div>
        <Button variant='destructive' size='sm' onClick={handleRevoke} disabled={isRevoking}>
          {t('account.revoke-session')}
        </Button>
      </div>
    </Card>
  )
}

export default ActiveSessions
