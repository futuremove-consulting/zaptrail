'use client';

import { useEffect } from 'react';

export interface UseReviewKeyboardOptions {
  items: Array<{ id: string }>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onApprove?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
}

export function useReviewKeyboard({
  items,
  selectedId,
  onSelect,
  onApprove,
  onEdit,
  onReject,
}: UseReviewKeyboardOptions): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (items.length === 0) return;

      const currentIndex = selectedId
        ? items.findIndex((item) => item.id === selectedId)
        : -1;

      if (event.key === 'j' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex =
          currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        onSelect(items[nextIndex].id);
      } else if (event.key === 'k' || event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        onSelect(items[prevIndex].id);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onSelect(null);
      } else if (event.key === 'Enter' && selectedId && onApprove) {
        event.preventDefault();
        onApprove();
      } else if (event.key === 'e' && selectedId && onEdit) {
        event.preventDefault();
        onEdit();
      } else if (event.key === 'r' && selectedId && onReject) {
        event.preventDefault();
        onReject();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedId, onSelect, onApprove, onEdit, onReject]);
}
