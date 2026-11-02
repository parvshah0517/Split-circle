const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

const compact = (rules) => Object.fromEntries(Object.entries(rules).filter(([, message]) => message));

const requiredMessage = (label, value) => (value.trim() ? undefined : `${label} is required.`);

export function validateEmail(value) {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

export function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return undefined;
}

export function validateLogin(values) {
  return compact({
    email: validateEmail(values.email),
    password: values.password ? undefined : "Password is required.",
  });
}

export function validateRegistration(values) {
  return compact({
    name: requiredMessage("Full name", values.name),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirmPassword:
      values.confirmPassword !== values.password ? "Passwords don't match." : undefined,
  });
}

export function validateProfile(values) {
  const avatarUrl = values.avatarUrl.trim();
  return compact({
    name: requiredMessage("Name", values.name),
    avatarUrl: avatarUrl && !isHttpUrl(avatarUrl) ? "Enter a valid image URL starting with http or https." : undefined,
  });
}

function isHttpUrl(value) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
