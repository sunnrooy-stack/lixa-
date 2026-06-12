import { ArrowLeft, Check, Coins } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { motion } from "motion/react"
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App';
const plans = [
    {
        key: "free",
        name: "Free",
        price: "₹0",
        credits: 100,
        description: "Perfect to explore LIXA AI",
        features: [
            "AI website generation",
            "Responsive HTML output",
            "Basic animations",
        ],
        popular: false,
        button: "Get Started",
    },
    {
        key: "pro",
        name: "Pro",
        price: "₹499",
        credits: 500,
        description: "For serious creators & freelancers",
        features: [
            "Everything in Free",
            "Faster generation",
            "Edit & regenerate",
        ],
        popular: true,
        button: "Upgrade to Pro",
    },
    {
        key: "enterprise",
        name: "Enterprise",
        price: "₹1499",
        credits: 1000,
        description: "For teams & power users",
        features: [
            "Unlimited iterations",
            "Highest priority",
            "Team collaboration",
            "Dedicated support",
        ],
        popular: false,
        button: "Contact Sales",
    },
];
function Pricing() {
    const navigate = useNavigate()
  const dispatch = useDispatch()
  const {userData}=useSelector(state=>state.user)
  const [loading,setLoading]=useState(null)
    const handleBuy=async (planKey)=>{
if(!userData){
navigate("/")
return
}
if(planKey=="free"){
    navigate("/dashboard")
    return
}
setLoading(planKey)
try {
    const result=await axios.post(`${serverUrl}/api/billing/create-order`,{planType:planKey},{withCredentials:true})
    const data = result.data;

    const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: "INR",
        name: "LIXA AI",
        description: `Purchase ${planKey.toUpperCase()} Plan`,
        order_id: data.order.id,
        handler: async function (response) {
            try {
                const verifyRes = await axios.post(`${serverUrl}/api/billing/verify-payment`, {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    planType: planKey
                }, { withCredentials: true })
                
                if(verifyRes.data.success) {
                    const planDetails = plans.find(p=>p.key===planKey);
                    dispatch(setUserData({...userData, credits: userData.credits + planDetails.credits}));
                    navigate("/dashboard")
                }
            } catch(err) {
                console.log("verification error", err)
                alert("Payment verification failed")
            }
        },
        prefill: {
            name: userData.name,
            email: userData.email,
        },
        theme: {
            color: "#6366f1"
        }
    };
    
    if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please do a hard refresh of the page (Ctrl + Shift + R).");
        setLoading(null);
        return;
    }

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response){
        console.log(response.error);
        alert("Payment failed: " + response.error.description);
    });
    rzp.open();
    setLoading(null)

} catch (error) {
    console.log(error)
    alert("Error: " + (error.response?.data?.message || error.message));
    setLoading(null)
}

    }
    return (
        <div 
            className='relative min-h-screen overflow-hidden text-white px-6 pt-16 pb-24'
            style={{ background: 'radial-gradient(circle at 50% 50%, #f00 0%, #700 45%, #1a0000 100%)' }}
        >

            <button className='relative z-10 mb-8 flex items-center gap-2 text-sm text-white/70 hover:text-white transition' onClick={() => navigate("/")}>
                <ArrowLeft size={16} />
                Back
            </button>
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-4xl mx-auto text-center mb-14"
            >
                <h1 className='text-4xl md:text-5xl font-bold mb-4 drop-shadow-md'> Simple, transparent pricing</h1>
                <p className='text-white/80 text-lg'> Buy credits once. Build anytime.</p>
            </motion.div>

            <div className='relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
                {plans.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 }}
                        whileHover={{ y: -14, scale: 1.03 }}
                        className={`relative rounded-3xl p-8 border backdrop-blur-xl transition-all
              ${p.popular
                                ? "border-red-400 bg-gradient-to-b from-red-500/20 to-transparent shadow-2xl shadow-red-500/30"
                                : "border-white/20 bg-black/20 hover:border-red-400 hover:bg-black/40"
                            }`}
                    >
                        {p.popular && (
                            <span className='absolute top-5 right-5 px-3 py-1 text-xs rounded-full bg-red-500 font-medium shadow-md shadow-red-500/20'>Most Popular</span>
                        )}

                        <h1 className='text-xl font-semibold mb-2'>{p.name}</h1>
                        <p className='text-white/70 text-sm mb-6'>{p.description}</p>
                        <div className='flex items-end gap-1 mb-4'>
                            <span className='text-4xl font-bold'>{p.price}</span>
                            <span className='text-sm text-white/70 mb-1'>/one-time</span>
                        </div>

                        <div className='flex items-center gap-2 mb-8'>
                            <Coins size={18} className='text-yellow-400' />
                            <span className='font-semibold'>{p.credits} Credits</span>
                        </div>

                        <ul className='space-y-3 mb-10'>
                            {p.features.map((f) => (
                                <li
                                    key={f}
                                    className='flex items-center gap-2 text-sm text-white/90'
                                >
                                    <Check size={16} className='text-green-400' />
                                    {f}
                                </li>
                            ))}
                        </ul>


                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            disabled={loading}
                            onClick={()=>handleBuy(p.key)}
                            className={`w-full py-3 rounded-xl font-semibold transition shadow-lg
                               ${p.popular
                                    ? "bg-white text-red-600 hover:bg-zinc-100 shadow-white/10"
                                    : "bg-white/10 hover:bg-white/20"
                                } disabled:opacity-60`}
                        >
                            {loading===p.key?"Redirecting...":p.button}


                        </motion.button>


                    </motion.div>
                ))}
            </div>


        </div>
    )
}

export default Pricing
