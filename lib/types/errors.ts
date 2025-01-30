// TODO: Refactor this code to align with best practices

/**
 * Custom error class to handle fetch-related errors.
 */
export class FetchError extends Error {
  public status?: number;
  public info?: ApiError | ValidationError;

  constructor(
    message: string,
    status?: number,
    info?: ApiError | ValidationError
  ) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.info = info;
  }
}

/**
 * General API Error Interface
 */
export interface ApiError<T = unknown> {
  status: number;
  message: string;
  code?: string;
  details?: T;
}

/**
 * Validation Error Interface extending ApiError
 */
export interface ValidationError extends ApiError {
  errors: Record<string, string>;
}

/**
 * Django-specific Error Response Structures
 */
interface DjangoErrorResponseContext {
  error: string;
}

export interface DjangoErrorResponseDetail {
  ctx: DjangoErrorResponseContext;
}

export interface DjangoNinjaErrorResponse {
  message: string;
}

interface Django422ErrorDetail {
  type: string;
  loc: string[];
  msg: string;
  ctx: {
    error: string;
  };
}

export interface Django422Response {
  detail: Django422ErrorDetail[];
}

export interface DjangoNotFoundError {
  detail: string;
}

/**
 * Union Type for Possible Error Responses from Backend
 */
export type BackendErrorResponse =
  | DjangoNinjaErrorResponse
  | DjangoErrorResponseDetail[]
  | Django422Response
  | DjangoNotFoundError
  | ValidationError
  | ApiError;
