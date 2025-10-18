import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config'

export const docs = defineDocs({
  dir: 'src/content',
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true
    }
  },
  meta: {
    schema: metaSchema
  }
})

export default defineConfig()
