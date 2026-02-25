import { useEffect, useState } from 'react';

const useLoadingDots = (active) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!active) {
      setDots('');
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`));
    }, 350);
    return () => clearInterval(interval);
  }, [active]);

  return dots;
};

export default useLoadingDots;
