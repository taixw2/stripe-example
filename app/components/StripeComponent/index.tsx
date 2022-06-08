import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckForm";

let hydrating = true;

export function StripeComponent() {
  let [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  const stripePromise = useMemo(
    () =>
      hydrated
        ? loadStripe((window as any).ENV.STRIPE_PUBLIC_KEY!)
        : Promise.resolve(null as any),
    [hydrated]
  );

  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // fetch("/create-payment-intent", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
    // })
    //   .then((res) => res.json())
    //   .then((data) => setClientSecret(data.clientSecret));
  }, []);

  if (!hydrated) {
    return null;
  }

  const appearance = {
    theme: "stripe",
  } as const;

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="App">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}

      <button
        onClick={() => {
          fetch("/payment-intent", { method: "POST" })
            .then((res) => res.json())
            .then((data) => {
              console.log("🚀 data", data);
              setClientSecret(data.clientSecret);
            });
        }}
      >
        I'm logged in and I'm ready to create a payment now, click here!
      </button>
    </div>
  );
}

export default StripeComponent;
