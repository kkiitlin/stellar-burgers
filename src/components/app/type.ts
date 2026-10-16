import type { SerializedError } from '@reduxjs/toolkit';

export type AppContentProps = {
  isLoading: boolean;
  error: SerializedError | null;
  onRetry: () => void;
};
