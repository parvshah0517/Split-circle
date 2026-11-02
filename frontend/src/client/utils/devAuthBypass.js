// Development only: skips sign-in so the dashboard can be reviewed without a backend. Inactive in production builds.
export const DEV_AUTH_BYPASS = import.meta.env.DEV;

export const DEV_PREVIEW_USER = {
  id: "dev-preview-user",
  name: "Alex Morgan",
  email: "alex@example.com",
  avatarUrl: null,
};
