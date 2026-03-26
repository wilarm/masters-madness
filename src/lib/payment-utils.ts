/**
 * Detect whether a venmoLink value is a Venmo handle (e.g. "@username")
 * vs a full URL (e.g. "https://venmo.com/u/username").
 */
export function isVenmoHandle(link: string): boolean {
  return link.startsWith("@");
}

/**
 * Label for the payment tile link/text (e.g. "Pay via Venmo →" or "@johndoe")
 */
export function formatPaymentLabel(link: string): string {
  if (isVenmoHandle(link)) return `Venmo ${link}`;
  return "Pay via Venmo →";
}

/**
 * CTA text for the banner button (e.g. "Pay Now" vs "Venmo @johndoe")
 */
export function formatPaymentAction(link: string): string {
  if (isVenmoHandle(link)) return `Venmo ${link}`;
  return "Pay Now";
}
