import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = secretKey ? new Stripe(secretKey) : null;

// The unlock fee is intentionally fixed so checkout does not depend on importing
// the browser-side product catalog into the Vercel serverless function.
const UNLOCK_USD = 2.5;

function getOrigin(req: any) {
  const origin = req.headers?.origin;
  if (origin) return String(origin).replace(/\/$/, '');
  const proto = String(req.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers?.host;
  if (!host) throw new Error('Missing request host');
  return `${proto}://${host}`;
}

function getBody(req: any) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(500).json({
      error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to the Vercel Production environment.'
    });
  }

  try {
    const body = getBody(req);
    const productId = Number(body.productId);
    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const origin = getOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `ChinaSource Hub Supplier Access #${productId}` },
          unit_amount: Math.round(UNLOCK_USD * 100)
        },
        quantity: 1
      }],
      metadata: { productId: String(productId) },
      success_url: `${origin}/?payment=success&productId=${productId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled&productId=${productId}`
    });

    if (!session.url) {
      return res.status(502).json({ error: 'Stripe did not return a checkout URL.' });
    }

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    const message = typeof error?.message === 'string'
      ? error.message
      : 'Stripe rejected the checkout request.';
    return res.status(500).json({ error: `Stripe checkout failed: ${message}` });
  }
}
