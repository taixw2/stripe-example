import { stripe } from "~/models/user.server";
import { getUser } from "~/session.server";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  const body = await request.formData();
  if (!user) {
    return json({});
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: "eur",
    customer: user.customerId,
    payment_method: body.get("id")!.toString(),
    off_session: true,
    confirm: true,
  });

  return json({
    paymentIntent,
    clientSecret: paymentIntent.client_secret,
  });
};
