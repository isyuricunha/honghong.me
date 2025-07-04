import { ORPCError } from '@orpc/client'
import { eq, posts, sql } from '@tszhong0411/db'

import { publicProcedure } from '../root'
import { getViewInputSchema, incrementViewInputSchema, viewSchema } from '../schemas/views'

export const getView = publicProcedure
  .route({
    method: 'GET',
    path: '/posts/{slug}/views',
    summary: 'Get view',
    tags: ['Views']
  })
  .input(getViewInputSchema)
  .output(viewSchema)
  .handler(async ({ input, context }) => {
    const post = await context.db
      .select({ views: posts.views })
      .from(posts)
      .where(eq(posts.slug, input.slug))

    if (!post[0]) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Post not found'
      })
    }

    return {
      views: post[0].views
    }
  })

export const incrementView = publicProcedure
  .route({
    method: 'POST',
    path: '/posts/{slug}/views',
    summary: 'Increment view',
    tags: ['Views']
  })
  .input(incrementViewInputSchema)
  .output(viewSchema)
  .handler(async ({ input, context }) => {
    const views = await context.db
      .insert(posts)
      .values({
        slug: input.slug,
        views: 1
      })
      .onConflictDoUpdate({
        target: posts.slug,
        set: {
          views: sql<number>`${posts.views} + 1`
        }
      })
      .returning()

    return {
      views: views[0]?.views ?? 0
    }
  })
