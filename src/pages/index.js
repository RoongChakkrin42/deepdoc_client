import { useEffect } from 'react';
import { useRouter } from 'next/router';
export default function RedirectToSubmit() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /submit when the component mounts
    router.push('/submit');
  }, [router]);

  return null; // This component does not render anything
}
