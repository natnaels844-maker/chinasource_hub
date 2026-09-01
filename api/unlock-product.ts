import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const privateProducts: Record<string, { supplier: string; address: string; url: string }> = {
  '1': { supplier: 'Shenzhen PowerTech Energy Co., Ltd.', address: 'Longhua District, Shenzhen, Guangdong, China', url: 'https://www.alibaba.com/' },
  '2': { supplier: 'Guangzhou BrightSolar Technology Co., Ltd.', address: 'Baiyun District, Guangzhou, Guangdong, China', url: 'https://www.made-in-china.com/' },
  '3': { supplier: 'Shenzhen AudioLink Electronics Co., Ltd.', address: 'Bao’an District, Shenzhen, Guangdong, China', url: 'https://www.1688.com/' },
  '4': { supplier: 'Ningbo HomePro Appliances Co., Ltd.', address: 'Ningbo, Zhejiang, China', url: 'https://www.globalsources.com/' },
  '5': { supplier: 'Huizhou Longzhixin Electronic Technology Co., Ltd.', address: 'Huizhou, Guangdong, China', url: 'https://longzhixin.m.en.alibaba.com/?productId=1601588165721' },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe is not configured' });
  try {
    const { sessionId, productId } = req.body || {};
    const product = privateProducts[String(productId)];
    if (!product || !sessionId) return res.status(400).json({ error: 'Missing product or session' });
    const session = await stripe.checkout.sessions.retrieve(String(sessionId));
    const paid = session.payment_status === 'paid' && session.status === 'complete' && session.metadata?.productId === String(productId);
    if (!paid) return res.status(402).json({ error: 'Payment has not been verified' });
    return res.status(200).json(product);
  } catch {
    return res.status(400).json({ error: 'Invalid payment session' });
  }
}
