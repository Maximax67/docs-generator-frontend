export type ApiError = { detail?: string };

export type FastAPIErrorDetail = { msg?: string };

export type AxiosErrorLike = {
  response?: {
    data?: { detail?: unknown };
  };
  message?: string;
};
