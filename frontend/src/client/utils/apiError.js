const FALLBACK_MESSAGES = {
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "This conflicts with existing data. Please review and try again.",
  422: "Please check the highlighted fields and try again.",
  500: "Something went wrong on our side. Please try again.",
};

export function normalizeApiError(error) {
  if (!error.response) {
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message: "We couldn't reach the SplitCircle server. Check your connection and try again.",
      errors: [],
    };
  }

  const { status, data } = error.response;

  return {
    status,
    code: data?.code ?? "UNKNOWN_ERROR",
    message: data?.message ?? FALLBACK_MESSAGES[status] ?? "Something went wrong. Please try again.",
    errors: Array.isArray(data?.errors) ? data.errors : [],
  };
}

export function getFieldErrors(error) {
  const fieldErrors = {};

  (error.errors ?? []).forEach((item) => {
    const field = item.field ?? item.path ?? item.param;
    const message = item.message ?? item.msg;
    if (field && message && !fieldErrors[field]) {
      fieldErrors[field] = message;
    }
  });

  return fieldErrors;
}
