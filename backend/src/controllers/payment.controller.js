import Stripe from "stripe";
import pool from "../config/database.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { id } = req.params; // company_id
    
    // get company details to know the plan and amount 
    const companyRes = await pool.query(
      `SELECT * FROM companies WHERE company_id = $1 AND admin_id = $2`,
      [id, req.user.id] // ensure they own the company
    );

    if (companyRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    const company = companyRes.rows[0];

    const plan = company.plan || "standard";
    // amount in INR paise
    const amounts = { basic: 149900, standard: 249900, premium: 399900 };
    const amount = amounts[plan];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Email Awareness ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
            },
            unit_amount: amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        company_id: id,
        admin_id: req.user.id,
      },
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/dashboard/${id}/bills/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/dashboard/${id}/bills/payment?canceled=true`,
    });

    res.json({ success: true, id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const stripeWebhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // this needs raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.warn("Webhook signature verification failed (or test mode). Using fallback mode for event processing.");
    // For development without explicit webhook secret setup, parse body
    event = req.body;
  }

  // In case the body was already parsed natively by express or we bypass verification
  if(Buffer.isBuffer(event)) {
      event = JSON.parse(event.toString());
  } else if(Buffer.isBuffer(req.body)) {
      event = JSON.parse(req.body.toString());
  }

  if (event?.type === "checkout.session.completed") {
    const session = event.data.object;
    const company_id = session.metadata?.company_id;
    // update the db to is_paid = true
    if (company_id) {
       await pool.query(
        `UPDATE companies SET is_paid = true WHERE company_id = $1`,
        [company_id]
       );
    }
  }

  res.send();
};
