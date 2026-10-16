import { FILE_POSTS, mergePosts, type Post, type PostRecord } from '~/lib/posts'
import { getStore } from './store'

let cache: { at: number; posts: Post[] } | undefined

/** Server-side loader used by server routes (RSS, sitemap) and server functions. */
export async function loadPosts(): Promise<Post[]> {
  if (cache && Date.now() - cache.at < 10_000) return cache.posts
  let saved: PostRecord[] = []
  try { saved = await getStore().posts() } catch (e) { console.error('posts: could not read saved posts', e) }
  const posts = mergePosts(FILE_POSTS, saved)
  cache = { at: Date.now(), posts }
  return posts
}
export const bust = () => { cache = undefined }

