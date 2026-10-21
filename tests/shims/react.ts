export function useState<T>(init: T): [T, (val: T | ((prev: T) => T)) => void] {
  return [init, () => {}];
}

export function useEffect(fn: any, deps?: any[]): void {}

export function useCallback<T extends (...args: any[]) => any>(fn: T, deps?: any[]): T {
  return fn;
}

export default {
  useState,
  useEffect,
  useCallback,
};
