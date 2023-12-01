import { TRPCError } from '@trpc/server';
import { AxiosError } from 'axios';

export const mapAxiosErrorToTRPCError = (axiosError: AxiosError): TRPCError => {
  let message = axiosError.message;

  switch (axiosError.response?.status) {
    case 400:
      return new TRPCError({ code: 'BAD_REQUEST', message });
    case 401:
      return new TRPCError({ code: 'UNAUTHORIZED', message });
    case 403:
      return new TRPCError({ code: 'FORBIDDEN', message });
    case 404:
      return new TRPCError({ code: 'NOT_FOUND', message });
    case 500:
      return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
    default:
      return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'An unknown error occurred' });
  }
}
