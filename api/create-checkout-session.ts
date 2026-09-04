import Stripe from 'stripe';
import {products} from '../src/products';

const secretKey=process.env.STRIPE_SECRET_KEY||'';
const stripe=secretKey?new Stripe(secretKey):null;
function getOrigin(req:any){const origin=req.headers?.origin;if(origin)return origin.replace(/\/$/,'');const proto=String(req.headers?.['x-forwarded-proto']||'https').split(',')[0].trim();const host=req.headers?.host;if(!host)throw Error('Missing request host');return `${proto}://${host}`}
export default async function handler(req:any,res:any){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!stripe)return res.status(500).json({error:'Stripe is not configured. Add STRIPE_SECRET_KEY to the Vercel Production environment.'});
 try{const productId=Number(req.body?.productId);const product=products.find(p=>p.id===productId);if(!product)return res.status(400).json({error:'Invalid product'});const origin=getOrigin(req);const session=await stripe.checkout.sessions.create({mode:'payment',line_items:[{price_data:{currency:'usd',product_data:{name:`Supplier Access: ${product.name}`},unit_amount:Math.round(product.unlock*100)},quantity:1}],metadata:{productId:String(product.id)},success_url:`${origin}/?payment=success&productId=${product.id}&session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${origin}/?payment=cancelled&productId=${product.id}`});if(!session.url)return res.status(500).json({error:'Stripe did not return a checkout URL.'});return res.status(200).json({url:session.url})}catch(error:any){console.error('Stripe checkout error:',error);return res.status(500).json({error:`Stripe checkout failed: ${typeof error?.message==='string'?error.message:'Stripe rejected the checkout request.'}`})}
}
