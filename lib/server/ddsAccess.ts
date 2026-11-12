/**
 * DDS Submission is opened account by account. DDS_SUBMISSION_EMAILS is a comma-separated
 * list of email addresses, "@domain" entries, or "*" for everyone. Unset or empty: nobody.
 * Kept in the environment so no personal address lives in the (public) code.
 */
export function ddsAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const address = email.trim().toLowerCase();
  return (process.env.DDS_SUBMISSION_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => entry === "*" || entry === address || (entry.startsWith("@") && address.endsWith(entry)));
}

export const DDS_NOT_AVAILABLE = "DDS Submission isn't available for your account yet.";
