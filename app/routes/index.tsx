import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUser } from "~/session.server";
import { createUser, getUserPaymentMethods } from "~/models/user.server";
import { safeRedirect } from "~/utils";
import StripeComponent from "~/components/StripeComponent";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    return json({});
  }

  const paymentMethods = await getUserPaymentMethods(user.customerId);
  return json({
    paymentMethods,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  const user = await createUser(email as string, password as string);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Stripe",
  };
};

export default function StripePage() {
  const loaderData = useLoaderData();
  const submit = useSubmit();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <p>支付方式列表：</p>
        <div className="mb-5 w-48 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900">
          {loaderData.paymentMethods.data.map((paymentMethod: any) => {
            return (
              <span
                onClick={() => {
                  submit(
                    {
                      id: paymentMethod.id,
                    },
                    {
                      method: "post",
                      action: "/payment-with-saved-method",
                    }
                  );
                }}
                className="block w-full cursor-pointer rounded-b-lg border-b border-gray-200 px-4 py-2 hover:bg-gray-100 hover:text-blue-700 focus:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                {paymentMethod.card.brand}-{paymentMethod.card.last4}
              </span>
            );
          })}
        </div>

        <Form method="post" className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input id="email" required autoFocus={true} name="email" type="email" autoComplete="email" />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input id="password" name="password" type="password" autoComplete="current-password" className="w-full rounded border border-gray-500 px-2 py-1 text-lg" />
            </div>
          </div>

          <button type="submit" className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"> Log in </button>
        </Form>

        {loaderData.paymentMethods ? <StripeComponent /> : null}
      </div>
    </div>
  );
}
