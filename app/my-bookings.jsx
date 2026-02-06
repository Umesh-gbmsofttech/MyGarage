import { useEffect } from 'react';
import { useRouter } from 'expo-router';

const MyBookingsRedirect = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/bookings');
  }, [router]);
  return null;
};

export default MyBookingsRedirect;
