import { stripe } from "~/models/user.server";
import { getUser } from "~/session.server";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    return json({});
  }

  const paymentIntent = await stripe.paymentIntents.create({
    customer: user.customerId,
    setup_future_usage: "off_session",
    amount: 1400,
    currency: "eur",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return json({
    paymentIntent,
    clientSecret: paymentIntent.client_secret,
  });
};
