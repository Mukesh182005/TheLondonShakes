import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();
    const secret_key = process.env.STRIPE_SECRET_KEY;

    if (!secret_key) {
      // In development / demo environment without keys, return mock PaymentIntent
      return NextResponse.json({
        clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substring(2, 9),
        isMock: true,
      });
    }

    // Initialize Stripe client
    const stripe = new Stripe(secret_key);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // in cents
      currency: 'inr',
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe PaymentIntent creation error:', error);
    const message = error instanceof Error ? error.message : 'Payment initiation failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
