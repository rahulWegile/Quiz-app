import query from '../database/db.js'
import Stripe from 'stripe'
import * as quiz from '../models/quiz.model.js'  

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)  

export const payment = async (req, res) => {

     console.log("💳 Payment hit — user:", req.user?.id, "session:", req.body?.session_id)
    console.log("Stripe key starts with:", process.env.STRIPE_SECRET_KEY?.substring(0, 10))
   
   const { session_id, mode } = req.body
    const user_id = req.user.id        
    const user_email = req.user.email  

    if (!session_id) {
        return res.status(400).json({ success: false, message: "quiz session not found" })
    }

    try {
        const session = await stripe.checkout.sessions.create({  
            payment_method_types: ['card'],
            mode: 'payment',              
            customer_email: user_email,
            line_items: [{                
                price_data: {
                    currency: 'inr',      
                    product_data: { name: 'BrainBolt Quiz Attempt' },
                    unit_amount: 9900
                },
                quantity: 1
            }],
            success_url: `${process.env.FRONTEND_URL}/payment/success?session_id=${session_id}&stripe_session_id={CHECKOUT_SESSION_ID}&mode=${mode}`,
             cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
            metadata: { user_id, session_id }
        })
        return res.json({ success: true, url: session.url })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event

    try {
        event = stripe.webhooks.constructEvent(  // ✅ use stripe instance not Stripe class
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        console.error("Webhook error:", err.message)
        return res.status(400).send(`Webhook error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const { user_id, session_id } = session.metadata

        try {
            await query(
                `INSERT INTO paid_attempts (user_id, session_id) 
                 VALUES ($1, $2) 
                 ON CONFLICT DO NOTHING`,
                [user_id, session_id]
            )
            console.log(`✅ Payment confirmed — user ${user_id} for session ${session_id}`)
        } catch (err) {
            console.error("DB error:", err)
        }
    }

    res.json({ received: true })
}

export const confirmPayment = async (req, res) => {
    const { session_id, stripe_session_id } = req.body
    const user_id = req.user.id

    try {
        // ✅ verify with Stripe that payment was actually completed
        const stripeSession = await stripe.checkout.sessions.retrieve(stripe_session_id)
        
        if (stripeSession.payment_status !== 'paid') {
            return res.status(400).json({ success: false, message: "Payment not completed" })
        }

        await query(
            `INSERT INTO paid_attempts (user_id, session_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [user_id, session_id]
        )
        return res.json({ success: true })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}