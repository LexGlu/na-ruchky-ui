import { BaseApiError, ApiErrorFactory, ServerError } from "./errors";

// ============================================================================
// CENTRALIZED API OPERATION WRAPPER
// ============================================================================

export class ApiOperationWrapper {
  /**
   * Executes an API operation with centralized error handling
   */
  static async execute<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      resource?: string;
      identifier?: string;
    }
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      // Log the error for debugging
      console.error(`API Error in ${context.operationName}:`, error);

      // Re-throw if it's already our custom error
      if (error instanceof BaseApiError) {
        throw error;
      }

      // Handle ky HTTPError (assuming FetchError from our previous implementation)
      if (error && typeof error === "object" && "status" in error) {
        const fetchError = error as {
          status: number;
          message: string;
          info?: unknown;
        };
        throw ApiErrorFactory.createFromResponse(
          fetchError.info,
          fetchError.status
        );
      }

      // Handle generic errors
      if (error instanceof Error) {
        throw new ServerError(
          `${context.operationName} failed: ${error.message}`
        );
      }

      // Unknown error
      throw new ServerError(`Unknown error in ${context.operationName}`);
    }
  }
}
