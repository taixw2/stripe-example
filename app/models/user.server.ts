import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import StripeConstructor from "stripe";

export const stripe = new StripeConstructor(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2020-08-27",
});

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, email: true, customerId: true },
  });

  if (user) {
    return user;
  }

  const customer = await stripe.customers.create();
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      customerId: customer.id,
    },
  });
}

export async function getUserPaymentMethods(customerId: string) {
  return await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
}
