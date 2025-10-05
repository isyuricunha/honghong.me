import 'server-only'

import { S3Client } from '@aws-sdk/client-s3'
import { env } from '@repo/env'

type R2Client = {
  client: S3Client
  bucketName: string
  publicUrl: string
}

const createClient = (): R2Client | undefined => {
  const endpoint = env.CLOUDFLARE_R2_ENDPOINT
  const accessKeyId = env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  const bucketName = env.CLOUDFLARE_R2_BUCKET_NAME
  const publicUrl = env.CLOUDFLARE_R2_PUBLIC_URL

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return
  }

  const client = new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })

  return {
    client,
    bucketName,
    publicUrl
  }
}

let r2Client: R2Client | undefined

export const getCloudflareR2 = () => {
  r2Client ??= createClient()
  return r2Client
}
