import { ORPCError } from '@orpc/client'
import { createId } from '@paralleldrive/cuid2'
import { and, desc, eq, guestbook, lt } from '@tszhong0411/db'
import { env, flags } from '@tszhong0411/env'

import { isProduction } from '@/lib/constants'
import { getDefaultImage } from '@/utils/get-default-image'

import { protectedProcedure, publicProcedure } from '../root'
import { emptyOutputSchema } from '../schemas/common'
import {
  createMessageInputSchema,
  deleteMessageInputSchema,
  guestbookInputSchema,
  guestbookSchema,
  messageSchema
} from '../schemas/guestbook'

export const listMessages = publicProcedure
  .route({
    method: 'GET',
    path: '/guestbook',
    summary: 'List messages',
    tags: ['Guestbook']
  })
  .input(guestbookInputSchema)
  .output(guestbookSchema)
  .handler(async ({ input, context }) => {
    const query = await context.db.query.guestbook.findMany({
      where: and(input.cursor ? lt(guestbook.createdAt, input.cursor) : undefined),
      limit: input.limit,
      with: {
        user: {
          columns: {
            name: true,
            image: true,
            id: true
          }
        }
      },
      orderBy: desc(guestbook.updatedAt)
    })

    const result = query.map((message) => {
      const defaultImage = getDefaultImage(message.user.id)

      return {
        ...message,
        user: {
          ...message.user,
          name: message.user.name,
          image: message.user.image ?? defaultImage
        }
      }
    })

    return {
      messages: result,
      nextCursor: result.at(-1)?.updatedAt ?? null
    }
  })

export const createMessage = protectedProcedure
  .route({
    method: 'POST',
    path: '/guestbook',
    summary: 'Create message',
    tags: ['Guestbook']
  })
  .input(createMessageInputSchema)
  .output(messageSchema)
  .handler(async ({ input, context }) => {
    const user = context.session.user

    const [message] = await context.db
      .insert(guestbook)
      .values({
        id: createId(),
        body: input.message,
        userId: user.id
      })
      .returning()

    if (!message) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create message'
      })
    }

    if (flags.guestbookNotification && isProduction) {
      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: null,
          embeds: [
            {
              title: 'New comment!',
              description: input.message,
              url: 'https://nelsonlai.me/guestbook',
              color: '6609519',
              author: {
                name: user.name,
                icon_url: user.image
              },
              timestamp: new Date().toISOString()
            }
          ],
          username: 'Blog',
          avatar_url:
            'https://cdn.discordapp.com/avatars/1123845082672537751/8af603a10f1d2f86ebc922ede339cd3a.webp',
          attachments: []
        })
      })
    }

    return message
  })

export const deleteMessage = protectedProcedure
  .route({
    method: 'DELETE',
    path: '/guestbook/{id}',
    summary: 'Delete message',
    tags: ['Guestbook']
  })
  .input(deleteMessageInputSchema)
  .output(emptyOutputSchema)
  .handler(async ({ input, context }) => {
    const user = context.session.user

    const message = await context.db.query.guestbook.findFirst({
      where: and(eq(guestbook.id, input.id), eq(guestbook.userId, user.id))
    })

    if (!message) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Message not found'
      })
    }

    await context.db.delete(guestbook).where(eq(guestbook.id, input.id))
  })
