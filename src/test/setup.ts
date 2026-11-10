if (typeof window !== 'undefined') {
  // @ts-expect-error jest-dom side-effect registration
  await import('@testing-library/jest-dom');
}
export {};
