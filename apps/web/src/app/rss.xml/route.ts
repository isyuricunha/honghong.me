import { i18n } from '@tszhong0411/i18n/config'
import { getTranslations } from '@tszhong0411/i18n/server'
import { allPosts } from 'content-collections'
import { NextResponse } from 'next/server'
import RSS from 'rss'

import { SITE_NAME } from '@/lib/constants'
import { getBaseUrl } from '@/utils/get-base-url'

export const GET = async () => {
  const t = await getTranslations({ locale: i18n.defaultLocale })

  const feed = new RSS({
    title: t('metadata.site-title'),
    description: t('metadata.site-description'),
    site_url: getBaseUrl(),
    feed_url: `${getBaseUrl()}/rss.xml`,
    language: 'en-US',
    image_url: `${getBaseUrl()}/images/og.png`
  })

  const posts = allPosts.filter((p) => p.locale === i18n.defaultLocale)

  for (const post of posts) {
    const { title, summary, date, slug } = post

    feed.item({
      title,
      url: `${getBaseUrl()}/blog/${slug}`,
      date,
      description: summary,
      author: SITE_NAME
    })
  }

  return new NextResponse(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}
