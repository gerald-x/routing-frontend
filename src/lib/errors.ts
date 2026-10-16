import { isHTTPError, isTimeoutError } from "ky";
import type { ApiErrorResponse } from "@/types";

function hasErrorMessage(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as ApiErrorResponse).error === "string"
  );
}

// Prefers the backend's `{ error }` message over ky's generic status text
export function getErrorMessage(error: unknown) {
  if (isHTTPError(error) && hasErrorMessage(error.data)) return error.data.error;
  if (isTimeoutError(error)) return "The server took too long to respond.";
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
