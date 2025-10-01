import type { Metadata } from 'next'
import type { WebPage, WithContext } from 'schema-dts'

import { routing } from '@repo/i18n/routing'
import { getTranslations, setRequestLocale } from '@repo/i18n/server'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'

import JsonLd from '@/components/json-ld'
import PageHeader from '@/components/page-header'
import { MY_NAME } from '@/lib/constants'
import { createMetadata } from '@/lib/metadata'
import { getBaseUrl } from '@/utils/get-base-url'
import { getLocalizedPath } from '@/utils/get-localized-path'

import Guestbook from './guestbook'

export const generateStaticParams = (): Array<{ locale: string }> => {
  return routing.locales.map((locale) => ({ locale }))
}

export const generateMetadata = async (props: PageProps<'/[locale]/guestbook'>): Promise<Metadata> => {
  const { params } = props
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    return {}
  }

  const t = await getTranslations({ locale, namespace: 'guestbook' })
  const title = t('title')
  const description = t('description')

  return createMetadata({
    pathname: '/guestbook',
    title,
    description,
    locale,
    ogImagePathname: '/guestbook/og-image.png'
  })
}

const Page = async (props: PageProps<'/[locale]/guestbook'>) => {
  const { params } = props
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const t = await getTranslations()
  const title = t('guestbook.title')
  const description = t('guestbook.description')
  const url = getLocalizedPath({ locale, pathname: '/guestbook' })

  const jsonLd: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: MY_NAME,
      url: getBaseUrl()
    },
    inLanguage: locale
  }

  return (
    <>
      <JsonLd json={jsonLd} />
      <PageHeader title={title} description={description} />
      <Guestbook />
    </>
  )
}

export default Page
