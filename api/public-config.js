export default function handler(_req, res) {
  const stripeMode = process.env.STRIPE_MODE === "live" ? "live" : "demo";

  res.status(200).json({
    stripe: {
      mode: stripeMode,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      checkoutEndpoint: "/api/create-checkout-session"
    }
  });
}
