import { createFileRoute } from '@tanstack/react-router'
import { seo } from '~/lib/seo'

export const Route = createFileRoute('/community')({
  head: () => seo({ title: 'Comment Policy and Privacy', description: 'House rules for comments, what we store, and how to report a comment.', path: '/community' }),
  component: Page,
})

function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="eyebrow text-accent">Community</div>
      <h1 className="display mt-1 text-4xl font-bold sm:text-5xl">Comment policy and privacy</h1>
      <div className="prose-ll mt-8 !text-[19px]">
        <h2>House rules</h2>
        <ul>
          <li>Write about your own experience. Family topics are personal, so please do not name relatives or other identifiable people.</li>
          <li>Be kind to people who see things differently. Disagree with ideas, not with people.</li>
          <li>Please do not give medical or mental-health advice. If a post touched something heavy for you, talking to a counselor or a trusted adult can help.</li>
          <li>No links, ads, or self-promotion. Links are switched off for now.</li>
        </ul>
        <h2>How it works</h2>
        <p>Comments appear as soon as you post them. The site owner reads them afterwards and removes any that are abusive, identify private individuals, or are spam. Each comment has a Report button, and a comment reported several times is hidden until it has been reviewed.</p>
        <h2>What we store</h2>
        <ul>
          <li>The name or nickname you type, your comment, and the time you posted it. You do not need to use your real name.</li>
          <li>A salted, one-way hash of your IP address, used only to limit spam. It cannot be turned back into your address.</li>
          <li>Your nickname is remembered in your own browser so you do not have to retype it. We use no advertising or tracking scripts.</li>
        </ul>
        <p>To have a comment removed, use its Report button and say why in a follow-up comment, or ask the research team through the University of Caloocan City.</p>
      </div>
    </div>
  )
}
