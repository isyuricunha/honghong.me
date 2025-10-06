import type { Metadata } from 'next'
import type { AboutPage, WithContext } from 'schema-dts'

import { getTranslations, setRequestLocale } from '@repo/i18n/server'
import { notFound } from 'next/navigation'
import { type Locale, useTranslations } from 'next-intl'
import { use } from 'react'

import JsonLd from '@/components/json-ld'
import Mdx from '@/components/mdx'
import PageHeader from '@/components/page-header'
import {
  MY_NAME,
  SITE_FACEBOOK_URL,
  SITE_GITHUB_URL,
  SITE_INSTAGRAM_URL,
  SITE_X_URL,
  SITE_YOUTUBE_URL
} from '@/lib/constants'
import { getPageBySlug } from '@/lib/content'
import { createMetadata } from '@/lib/metadata'
import { getBaseUrl } from '@/utils/get-base-url'
import { getLocalizedPath } from '@/utils/get-localized-path'

export const generateMetadata = async (props: PageProps<'/[locale]/about'>): Promise<Metadata> => {
  const { params } = props
  const { locale } = await params

  const t = await getTranslations({ locale: locale as Locale })
  const title = t('common.labels.about')
  const description = t('about.description')

  return createMetadata({
    pathname: '/about',
    title,
    description,
    locale,
    ogImagePathname: '/about/og-image.png',
    openGraph: {
      type: 'profile'
    }
  })
}

const Page = (props: PageProps<'/[locale]/about'>) => {
  const { params } = props
  const { locale } = use(params)

  setRequestLocale(locale as Locale)

  const t = useTranslations()
  const title = t('common.labels.about')
  const description = t('about.description')
  const url = getLocalizedPath({ locale, pathname: '/about' })
  const page = getPageBySlug(locale, 'about')

  const jsonLd: WithContext<AboutPage> = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: title,
    description,
    url,
    mainEntity: {
      '@type': 'Person',
      name: MY_NAME,
      description: t('metadata.site-description'),
      url: getBaseUrl(),
      sameAs: [SITE_FACEBOOK_URL, SITE_INSTAGRAM_URL, SITE_X_URL, SITE_GITHUB_URL, SITE_YOUTUBE_URL]
    },
    inLanguage: locale
  }

  if (!page) {
    return notFound()
  }

  const { code } = page

  return (
    <>
      <JsonLd json={jsonLd} />
      <PageHeader title={title} description={description} />
      <Mdx code={code} />
    </>
  )
}

export default Page
