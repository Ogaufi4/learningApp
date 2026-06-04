export const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return null;
}

export const passwordRuleText = `Minimum ${MIN_PASSWORD_LENGTH} characters`;
