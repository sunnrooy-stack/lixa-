import { PLANS } from "../config/plan.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";

export const createOrder = async (req, res) => {
    try {
        const { planType } = req.body;
        const userId = req.user._id;
        const plan = PLANS[planType];
        
        if (!plan || plan.price == 0) {
            return res.status(400).json({ message: "invalid paid plan" });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: plan.price * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const order = await instance.orders.create(options);

        return res.status(200).json({
            order,
            planType,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.description || error.message || "Failed to create order" });
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;
        const userId = req.user._id;

        const plan = PLANS[planType];
        if (!plan) {
            return res.status(400).json({ message: "invalid plan type" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const user = await User.findById(userId);
            if (user) {
                // Save payment details in MongoDB
                await Payment.create({
                    userId,
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature,
                    amount: plan.price,
                    planType,
                    status: "captured"
                });

                // Update user's credits and plan status
                user.credits += plan.credits;
                user.plan = planType;
                await user.save();

                return res.status(200).json({ 
                    success: true, 
                    message: "Payment verified and credits/plan updated", 
                    user 
                });
            } else {
                return res.status(404).json({ success: false, message: "User not found" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `verify payment error: ${error}` });
    }
}