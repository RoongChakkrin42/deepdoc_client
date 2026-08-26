import type { GetServerSideProps } from 'next';

/** The app has no landing page; submitting is the entry point. */
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/submit', permanent: false },
});

export default function Home() {
  return null;
}
