import { routing } from '@repo/i18n/routing'
import { getTranslations } from '@repo/i18n/server'
import { NextResponse } from 'next/server'
import RSS from 'rss'

import { MY_NAME } from '@/lib/constants'
import { allPosts } from '@/lib/content'
import { getBaseUrl } from '@/utils/get-base-url'

export const GET = async () => {
  const t = await getTranslations({ locale: routing.defaultLocale })

  const feed = new RSS({
    title: MY_NAME,
    description: t('metadata.site-description'),
    site_url: getBaseUrl(),
    feed_url: `${getBaseUrl()}/rss.xml`,
    language: 'en-US',
    image_url: `${getBaseUrl()}/og-image.png`
  })

  const posts = allPosts.filter((p) => p.locale === routing.defaultLocale)

  for (const post of posts) {
    feed.item({
      title: post.title,
      url: `${getBaseUrl()}/blog/${post.slug}`,
      date: post.date,
      description: post.summary,
      author: MY_NAME
    })
  }

  return new NextResponse(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}
