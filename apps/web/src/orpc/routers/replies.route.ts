import { and, comments, count, eq, isNotNull } from '@repo/db'

import { publicProcedure } from '../root'
import { countRepliesInputSchema, countRepliesSchema } from '../schemas/replies.schema'

export const countReplies = publicProcedure
  .input(countRepliesInputSchema)
  .output(countRepliesSchema)
  .handler(async ({ input, context }) => {
    const [result] = await context.db
      .select({
        value: count()
      })
      .from(comments)
      .where(and(eq(comments.postId, input.slug), isNotNull(comments.parentId)))

    return {
      count: result?.value ?? 0
    }
  })
