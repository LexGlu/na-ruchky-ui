// TODO: Refactor this code to align with best practices

import {
  BackendErrorResponse,
  DjangoNinjaErrorResponse,
  DjangoErrorResponseDetail,
  DjangoNotFoundError,
  Django422Response,
  ValidationError,
  ApiError,
} from "@/lib/types/errors";

/**
 * Type guard to check if errorResponse is DjangoNinjaErrorResponse
 */
export function isDjangoNinjaErrorResponse(
  errorResponse: BackendErrorResponse
): errorResponse is DjangoNinjaErrorResponse {
  return (
    typeof errorResponse === "object" &&
    errorResponse !== null &&
    "message" in errorResponse &&
    typeof (errorResponse as DjangoNinjaErrorResponse).message === "string"
  );
}

/**
 * Type guard to check if errorResponse is DjangoErrorResponseDetail[]
 */
export function isDjangoErrorResponseDetailArray(
  errorResponse: BackendErrorResponse
): errorResponse is DjangoErrorResponseDetail[] {
  return Array.isArray(errorResponse);
}

/**
 * Type guard to check if errorResponse is Django422Response
 */
export function isDjango422Response(
  errorResponse: BackendErrorResponse
): errorResponse is Django422Response {
  return (
    typeof errorResponse === "object" &&
    errorResponse !== null &&
    "detail" in errorResponse &&
    Array.isArray((errorResponse as Django422Response).detail)
  );
}

/**
 * Type guard to check if errorResponse is ValidationError
 */
export function isValidationError(
  errorResponse: BackendErrorResponse
): errorResponse is ValidationError {
  return (
    typeof errorResponse === "object" &&
    errorResponse !== null &&
    "errors" in errorResponse &&
    typeof (errorResponse as ValidationError).errors === "object"
  );
}

/**
 * Type guard to check if errorResponse is DjangoNotFoundError
 */
export function isDjangoNotFoundError(
  errorResponse: BackendErrorResponse
): errorResponse is DjangoNotFoundError {
  return (
    typeof errorResponse === "object" &&
    errorResponse !== null &&
    "detail" in errorResponse &&
    typeof (errorResponse as DjangoNotFoundError).detail === "string" &&
    /not found/i.test((errorResponse as DjangoNotFoundError).detail)
  );
}

/**
 * Type guard to check if errorResponse is ApiError
 */
export function isApiError(
  errorResponse: BackendErrorResponse
): errorResponse is ApiError {
  return (
    typeof errorResponse === "object" &&
    errorResponse !== null &&
    "status" in errorResponse &&
    typeof (errorResponse as ApiError).status === "number" &&
    "message" in errorResponse &&
    typeof (errorResponse as ApiError).message === "string"
  );
}
