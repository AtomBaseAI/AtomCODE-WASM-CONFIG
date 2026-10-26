"use client"

import { useEffect } from 'react';

export function usePageEnter(onPageEnter: () => void) {
  useEffect(() => {
    document.documentElement.addEventListener('mouseenter', onPageEnter);
    return () => document.documentElement.removeEventListener('mouseenter', onPageEnter);
  }, []);
}