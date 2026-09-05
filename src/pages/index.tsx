import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * The app has no landing page; submitting is the entry point.
 *
 * The redirect happens on the client rather than in `getServerSideProps`
 * because that was the only thing in the app requiring a Node server at
 * runtime — everything else is client-rendered. Without it the whole
 * frontend can be exported as static files, which is what lets it be served
 * from a CDN with no cold start. It costs a frame of blank page on `/`, and
 * nobody links to `/`.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    void router.replace('/submit');
  }, [router]);

  return null;
}
