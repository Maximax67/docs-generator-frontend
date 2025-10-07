import { AxiosErrorLike, FastAPIErrorDetail } from '@/types/errors';

export function toErrorMessage(error: unknown, fallback = 'Сталася помилка'): string {
  if (!error) return fallback;

  if (typeof error === 'object' && error !== null) {
    const maybeAxiosError = error as AxiosErrorLike;
    const detail = maybeAxiosError.response?.data?.detail;
    if (typeof detail === 'string') return detail;

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as FastAPIErrorDetail;
      if (first && typeof first.msg === 'string') return first.msg;
    }

    if (typeof maybeAxiosError.message === 'string') return maybeAxiosError.message;
  }

  return fallback;
}
