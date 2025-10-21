import fs from 'node:fs/promises'
import path from 'node:path'

import en from '@repo/i18n/messages/en.json'
import { routing } from '@repo/i18n/routing'
import { notFound } from 'next/navigation'
import { ImageResponse } from 'next/og'
import { NextResponse } from 'next/server'
import { hasLocale, type Locale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import OGImage from '@/components/og-image'
import { PROTECTED_ROUTES } from '@/lib/constants'
import { getPostBySlug } from '@/lib/content'
import { getOGImageFonts } from '@/lib/fonts'
import { pathnames } from '@/lib/pathnames'

export const GET = async (_request: Request, props: RouteContext<'/[locale]/og/[...slug]'>) => {
  const { params } = props
  const { slug, locale } = await params
  const normalizedSlug = slug.slice(0, -1)
  const pathname = `/${normalizedSlug.join('/')}`

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  if (pathname === '/') {
    return generateIndexOGImage()
  }

  if (pathname.startsWith('/blog/')) {
    return generateBlogOGImage(locale, normalizedSlug)
  }

  if (pathname.startsWith('/projects/')) {
    return generateProjectOGImage(normalizedSlug)
  }

  return generatePageOGImage(locale, normalizedSlug, pathname)
}

const generateIndexOGImage = async () => {
  const imageBuffer = await fs.readFile(path.join(process.cwd(), 'public', 'images', 'banner.png'))

  return new NextResponse(new Uint8Array(imageBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store'
    }
  })
}

const generateBlogOGImage = async (locale: Locale, slugs: string[]) => {
  const postSlug = slugs.at(-1)
  if (!postSlug) notFound()

  const post = getPostBySlug(locale, postSlug)
  if (!post) notFound()

  return generateOGImage(post.title, '/blog')
}

const generatePageOGImage = async (locale: Locale, slugs: string[], pathname: string) => {
  const pageSlug = slugs.at(-1)
  if (!pageSlug) notFound()

  if (!(pageSlug in en.common.labels)) notFound()

  const t = await getTranslations({ locale })

  return generateOGImage(t(`common.labels.${pageSlug as keyof typeof en.common.labels}`), pathname)
}

const generateProjectOGImage = async (slugs: string[]) => {
  const projectSlug = slugs.at(-1)
  if (!projectSlug) notFound()

  const imageBuffer = await fs.readFile(
    path.join(process.cwd(), 'public', 'images', 'projects', projectSlug, 'cover.png')
  )

  return new NextResponse(new Uint8Array(imageBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store'
    }
  })
}

const generateOGImage = async (title: string, url: string) => {
  const fonts = await getOGImageFonts(title)

  return new ImageResponse(<OGImage title={title} url={url} />, {
    width: 1200,
    height: 630,
    fonts
  })
}

export const generateStaticParams = (): Array<{ locale: string; slug: string[] }> => {
  return routing.locales.flatMap((locale) => {
    return [...pathnames, ...PROTECTED_ROUTES].map((pathname) => ({
      locale,
      slug: [...pathname.split('/'), 'image.webp'].filter(Boolean)
    }))
  })
}
