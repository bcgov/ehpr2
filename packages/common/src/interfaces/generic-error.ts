export interface GenericError {
  errorType: string;
  errorMessage: string;
  httpStatus: number;
  recipientId: string;
}
