import { StandardRPCJsonSerializer } from '@orpc/client/standard'
import { defaultShouldDehydrateQuery, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const serializer = new StandardRPCJsonSerializer()

export const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
        serializeData: (data) => {
          const [json, meta] = serializer.serialize(data)
          return { json, meta }
        }
      },
      hydrate: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Safe
        deserializeData: (data) => serializer.deserialize(data.json, data.meta)
      }
    },
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error(error.message)
      }
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(error.message)
      }
    })
  })
}
