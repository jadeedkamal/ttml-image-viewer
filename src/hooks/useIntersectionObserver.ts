import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const [element, setElement] = useState<Element | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (element && callback) {
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            callback();
          }
        },
        { threshold: 0.1, ...options }
      );

      observer.current.observe(element);

      return () => {
        if (observer.current) {
          observer.current.disconnect();
        }
      };
    }
  }, [element, callback, options]);

  return setElement;
}