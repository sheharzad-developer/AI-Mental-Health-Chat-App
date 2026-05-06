"use client";

export function UpgradeButton() {
  const link = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  if (!link) {
    return (
      <p className="mt-8 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
        Stripe payment link is not configured. Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK in .env.
      </p>
    );
  }

  return (
    <a
      href={link}
      className="mt-8 block w-full rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
    >
      Subscribe to Premium
    </a>
  );
}
