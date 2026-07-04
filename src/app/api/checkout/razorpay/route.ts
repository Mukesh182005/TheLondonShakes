import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { amount, receipt } = await request.json();

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      // In development / demo environment without keys, return a mock order
      return NextResponse.json({
        id: 'order_mock_' + Math.random().toString(36).substring(2, 9),
        currency: 'INR',
        amount: amount * 100,
        isMock: true,
      });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: receipt || 'receipt_' + Date.now(),
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    const message = error instanceof Error ? error.message : 'Payment initiation failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
