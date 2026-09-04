import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = secretKey ? new Stripe(secretKey) : null;

const products: Record<string, { name: string; unlock: number }> = {
  '1': { name: 'Portable Power Station 1000W', unlock: 2.5 },
  '2': { name: 'Solar Street Light 200W', unlock: 2.5 },
  '3': { name: 'TWS Bluetooth Earbuds', unlock: 2.5 },
  '4': { name: 'Electric Kitchen Blender', unlock: 2.5 },
  '5': { name: 'Black Desktop M-ATX Gaming PC Case', unlock: 2.5 },
  '6': { name: 'DDR3 4GB Desktop/Laptop RAM', unlock: 2.5 },
  '7': { name: 'DDR3 8GB RAM — 16 chips', unlock: 2.5 },
  '8': { name: 'DDR3 8GB RAM — 8 chips', unlock: 2.5 },
  '9': { name: 'DDR4 4GB RAM', unlock: 2.5 },
  '10': { name: 'DDR4 8GB RAM', unlock: 2.5 },
  '11': { name: 'DDR4 16GB RAM', unlock: 2.5 },
  '12': { name: 'DDR4 32GB RAM', unlock: 2.5 },
  '13': { name: 'DDR5 8GB RAM', unlock: 2.5 },
  '14': { name: 'DDR5 16GB RAM', unlock: 2.5 },
  '15': { name: 'DDR5 32GB RAM', unlock: 2.5 },
};

function getOrigin(req: any) {
  const origin = req.headers?.origin;
  if (origin) return origin.replace(/\/$/, '');
  const proto = String(req.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers?.host;
  if (!host) throw new Error('Missing request host');
  return `${proto}://${host}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!stripe) return res.status(500).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to the Vercel Production environment.' });

  try {
    const productId = String(req.body?.productId || '');
    const product = products[productId];
    if (!product) return res.status(400).json({ error: 'Invalid product' });

    const origin = getOrigin(req);
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

    if (!session.url) return res.status(500).json({ error: 'Stripe did not return a checkout URL.' });
    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    const message = typeof error?.message === 'string' ? error.message : 'Stripe rejected the checkout request.';
    return res.status(500).json({ error: `Stripe checkout failed: ${message}` });
  }
}
