type PasswordResetEmailInput = {
  resetUrl: string;
  to: string;
};

function getResetSender() {
  return process.env.RESET_PASSWORD_FROM_EMAIL || process.env.EMAIL_FROM || "noreply@example.com";
}

export async function sendPasswordResetEmail({ resetUrl, to }: PasswordResetEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn(`Skipping password reset email for ${to}: RESEND_API_KEY is not configured.`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResetSender(),
      to: [to],
      subject: "Reset your Diteme password",
      text: `Reset your password using this link: ${resetUrl}`,
      html: `<p>Reset your Diteme password by clicking the link below.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send password reset email: ${errorBody}`);
  }
}

