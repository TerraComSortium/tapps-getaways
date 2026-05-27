/** reusable API types for services */

/** standard success response */
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
  success: true;
  status?: number;
}

/** standard error response */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
  status?: number;
  code?: string;
}

/** responses union */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

//Axios errors
/** typed error structure Axios */
export interface AxiosErrorData {
  response?: {
    status?: number;
    statusText?: string;
    data?: ApiErrorResponse | unknown;
    headers?: Record<string, string>;
  };
  request?: unknown;
  message?: string;
  code?: string;
}

/** Axios's error check */
export function isAxiosError(error: unknown): error is AxiosErrorData {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}

/** check: response is an api error */
export function isApiError(data: unknown): data is ApiErrorResponse {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return !!(obj.message || obj.error || obj.errors);
}

/** check: if error has HTTP status */
export function hasStatus(error: unknown, status: number): boolean {
  if (!isAxiosError(error)) return false;
  return error.response?.status === status;
}

/** fallback chain error message getter */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    //if data is a object with error properties
    if (typeof data === 'object' && data !== null && isApiError(data)) {
      const apiErr = data;
      //get error message
      if (apiErr.message) return apiErr.message;
      if (apiErr.error) return apiErr.error;
      if (apiErr.errors) {
        const firstError = Object.values(apiErr.errors)[0];
        if (typeof firstError === 'string') return firstError;
        if (Array.isArray(firstError)) return firstError[0] || '';
      }
    }
    //fallback to error message
    return error.message || 'Network error';
  }
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

/** extract errors in readable format */
export function getDetailedError(error: unknown): {
  status?: number;
  message: string;
  details?: Record<string, string | string[]>;
} {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    const status = error.response?.status;

    if (typeof data === 'object' && data !== null && isApiError(data)) {
      const apiErr = data;
      return {
        status,
        message: getErrorMessage(error),
        details: apiErr.errors,
      };
    }
    return {
      status,
      message: error.message || `HTTP Error ${status}`,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

//logging helpers
/** logs error with context */
export function logApiError(
  context: string,
  error: unknown,
  additionalData?: Record<string, unknown>
): void {
  const { status, message, details } = getDetailedError(error);

  console.error(`[${context}]`, {
    status,
    message,
    details,
    ...additionalData,
  });
}

/** logs success api call with context */
export function logApiSuccess(
  context: string,
  data?: unknown,
  additionalData?: Record<string, unknown>
): void {
  console.info(`[${context}] Success`, {
    dataType: typeof data,
    ...additionalData,
  });
}