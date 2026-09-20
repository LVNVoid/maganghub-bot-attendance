export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly message?: string;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly { readonly field?: string; readonly message: string }[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
