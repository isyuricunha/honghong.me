import { Octokit } from '@octokit/rest'
import { env } from '@repo/env'

export const octokit: InstanceType<typeof Octokit> | null = env.GITHUB_TOKEN
  ? new Octokit({
      auth: env.GITHUB_TOKEN
    })
  : null
