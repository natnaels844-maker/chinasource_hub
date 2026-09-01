import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const products: Record<string, { name: string; unlock: number }> = {
  '1': { name: 'Portable Power Station 1000W', unlock: 9.99 },
  '2': { name: 'Solar Street Light 200W', unlock: 7.99 },
  '3': { name: 'TWS Bluetooth Earbuds', unlock: 5.99 },
  '4': { name: 'Electric Kitchen Blender', unlock: 6.99 },
  '5': { name: 'Black Desktop M-ATX Gaming PC Case', unlock: 7.99 },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe is not configured' });

  try {
    const productId = String(req.body?.productId || '');
    const product = products[productId];
    if (!product) return res.status(400).json({ error: 'Invalid product' });

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Supplier Access: ${product.name}` },
          unit_amount: Math.round(product.unlock * 100),
        },
        quantity: 1,
      }],
      metadata: { productId },
      success_url: `${origin}/?payment=success&productId=${encodeURIComponent(productId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled&productId=${encodeURIComponent(productId)}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to create checkout session' });
  }
}
