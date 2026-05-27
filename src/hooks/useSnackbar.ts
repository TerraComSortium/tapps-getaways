import { useState, useCallback } from 'react';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning';
}

const INITIAL_STATE: SnackbarState = {
  open: false,
  message: '',
  severity: 'success',
};

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<SnackbarState>(INITIAL_STATE);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState['severity']) => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return { snackbar, showSnackbar, closeSnackbar };
}