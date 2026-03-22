import Stripe from "stripe";  //initialises stripe with the secret key 
import { NextResponse } from "next/server"; //backend route - should never react the client

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { amount } = await req.json(); //gets amount
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents and avoids floating point values
      currency: "usd",
      automatic_payment_methods: { enabled: true }, // enables GPay, Apple Pay, card
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret }); //sends back the client secret to the frontend
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

//Frontend (payment page)
  // → POST /api/create-payment-intent with { amount: 29.99 }
  //   → Backend creates Stripe PaymentIntent for 2999 cents
  //   → Returns { clientSecret: "pi_xxx_secret_xxx" }
  // → Frontend uses clientSecret to render Stripe's payment form
  // → User pays → Stripe confirms → order saved to Firestore