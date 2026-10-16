import { getRouteApi } from '@tanstack/react-router'

const root = getRouteApi('__root__')
/** All published posts, loaded once by the root route (files plus anything saved in the admin). */
export const usePosts = () => root.useLoaderData()
