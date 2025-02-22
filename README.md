# Full Stack AI SaaS Web App with Authentication 🤯

## Overview

This project is a full stack AI SaaS web application built with NextJS 15, TailwindCSS, Stripe, TypeScript, and Clerk for user authentication, featuring robust user authentication, secure payment processing, and a modern responsive design.

## Features

- **User Authentication:** Secure sign-up, sign-in, and profile management using [Clerk](https://go.clerk.com/TFWZCy5).
- **Responsive UI:** Sleek and modern interface built with TailwindCSS.
- **Payment Processing:** Subscription management and secure payments via Stripe.
- **Type Safety:** Fully typed with TypeScript for improved maintainability.
- **Scalable Architecture:** Built on NextJS 15 with serverless functions and modern best practices.

## Technologies Used

- NextJS 15
- TailwindCSS
- Stripe
- TypeScript
- Clerk
- Prisma
- PostgreSQL

## Tutorial Video

Watch our detailed YouTube tutorial on how to build this project:  
[Build A Full Stack AI SaaS Web App With Authentication In NextJS 15, TailwindCSS, Stripe, TypeScript](https://youtu.be/RUE3nYI75VE)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/yourproject.git
   ```
2. **Navigate into the project directory:**
   ```bash
   cd yourproject
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Configure Environment Variables:**  
   Create a `.env.local` file in the project root and add your required variables (e.g., `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_BASE_URL`, `OPEN_ROUTER_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE`, etc.).
5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## Usage

- Visit `http://localhost:3000` to view the application.
- Sign up or sign in using Clerk.
- Manage your subscriptions and explore the AI-powered features.

## Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

```
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // <-- import Prisma client
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
const body = await req.text();
const signature = req.headers.get("stripe-signature");

let event: Stripe.Event;

// Verify Stripe event is legit
try {
event = stripe.webhooks.constructEvent(
body,
signature || "",
webhookSecret
);
} catch (err: any) {
console.error(`Webhook signature verification failed. ${err.message}`);
return NextResponse.json({ error: err.message }, { status: 400 });
}

try {
switch (event.type) {
case "checkout.session.completed": {
const session = event.data.object as Stripe.Checkout.Session;
await handleCheckoutSessionCompleted(session);
break;
}
case "invoice.payment_failed": {
const invoice = event.data.object as Stripe.Invoice;
await handleInvoicePaymentFailed(invoice);
break;
}
case "customer.subscription.deleted": {
const subscription = event.data.object as Stripe.Subscription;
await handleSubscriptionDeleted(subscription);
break;
}
// Add more event types as needed
default:
console.log(`Unhandled event type ${event.type}`);
}
} catch (e: any) {
console.error(`stripe error: ${e.message} | EVENT TYPE: ${event.type}`);
return NextResponse.json({ error: e.message }, { status: 400 });
}

return NextResponse.json({});
}

// Handler for successful checkout sessions
const handleCheckoutSessionCompleted = async (
session: Stripe.Checkout.Session
) => {
const userId = session.metadata?.clerkUserId;
console.log("Handling checkout.session.completed for user:", userId);

if (!userId) {
console.error("No userId found in session metadata.");
return;
}

// Retrieve subscription ID from the session
const subscriptionId = session.subscription as string;

if (!subscriptionId) {
console.error("No subscription ID found in session.");
return;
}

console.log("HHHHEHHEHE");
// Update Prisma with subscription details
try {
await prisma.profile.update({
where: { userId },
data: {
stripeSubscriptionId: subscriptionId,
subscriptionActive: true,
subscriptionTier: session.metadata?.planType || null,
},
});
console.log(`Subscription activated for user: ${userId}`);
} catch (error: any) {
console.error("Prisma Update Error:", error.message);
}
};

// Handler for failed invoice payments
const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
const subscriptionId = invoice.subscription as string;
console.log(
"Handling invoice.payment_failed for subscription:",
subscriptionId
);

if (!subscriptionId) {
console.error("No subscription ID found in invoice.");
return;
}

// Retrieve userId from subscription ID
let userId: string | undefined;
try {
const profile = await prisma.profile.findUnique({
where: { stripeSubscriptionId: subscriptionId },
select: { userId: true },
});

    if (!profile?.userId) {
      console.error("No profile found for this subscription ID.");
      return;
    }

    userId = profile.userId;

} catch (error: any) {
console.error("Prisma Query Error:", error.message);
return;
}

// Update Prisma with payment failure
try {
await prisma.profile.update({
where: { userId },
data: {
subscriptionActive: false,
},
});
console.log(`Subscription payment failed for user: ${userId}`);
} catch (error: any) {
console.error("Prisma Update Error:", error.message);
}
};

// Handler for subscription deletions (e.g., cancellations)
const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
const subscriptionId = subscription.id;
console.log(
"Handling customer.subscription.deleted for subscription:",
subscriptionId
);

// Retrieve userId from subscription ID
let userId: string | undefined;
try {
const profile = await prisma.profile.findUnique({
where: { stripeSubscriptionId: subscriptionId },
select: { userId: true },
});

    if (!profile?.userId) {
      console.error("No profile found for this subscription ID.");
      return;
    }

    userId = profile.userId;

} catch (error: any) {
console.error("Prisma Query Error:", error.message);
return;
}

// Update Prisma with subscription cancellation
try {
await prisma.profile.update({
where: { userId },
data: {
subscriptionActive: false,
stripeSubscriptionId: null,
},
});
console.log(`Subscription canceled for user: ${userId}`);
} catch (error: any) {
console.error("Prisma Update Error:", error.message);
}
};
```
