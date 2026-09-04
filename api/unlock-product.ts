import Stripe from 'stripe';
import {privateProducts1} from './private-data-1';

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY||'');
export default async function handler(req:any,res:any){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.STRIPE_SECRET_KEY)return res.status(500).json({error:'Stripe is not configured'});
 try{const {sessionId,productId}=req.body||{};const id=String(productId||'');const product=privateProducts1[id];if(!product||!sessionId)return res.status(400).json({error:'Supplier access for this listing is being prepared. Please try again shortly.'});const session=await stripe.checkout.sessions.retrieve(String(sessionId));const paid=session.payment_status==='paid'&&session.status==='complete'&&session.metadata?.productId===id;if(!paid)return res.status(402).json({error:'Payment has not been verified'});return res.status(200).json(product)}catch{ return res.status(400).json({error:'Invalid payment session'})}
}
