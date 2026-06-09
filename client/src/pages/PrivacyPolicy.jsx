import React from 'react'
import { ArrowLeft, Lock } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from "motion/react"

const sections = [
    {
        title: "1. Information We Collect",
        content: "We collect the following information:",
        list: [
            "Name",
            "Email address",
            "Account details",
            "Website generation requests",
            "Usage analytics"
        ]
    },
    {
        title: "2. Payment Information",
        content: "Payments are securely processed through Razorpay. We do not store complete card or banking information."
    },
    {
        title: "3. How We Use Data",
        content: "We use collected data for the following purposes:",
        list: [
            "Provide AI website generation services",
            "Improve platform performance",
            "Process payments",
            "Customer support",
            "Security and fraud prevention"
        ]
    },
    {
        title: "4. Cookies",
        content: "We may use cookies and similar technologies to improve user experience and analytics."
    },
    {
        title: "5. Third-Party Services",
        content: "We may use the following third-party services:",
        list: [
            "Firebase",
            "MongoDB",
            "Razorpay",
            "Cloud Hosting Services"
        ]
    },
    {
        title: "6. Data Protection",
        content: "We implement industry-standard security measures to protect user information."
    },
    {
        title: "7. Data Sharing",
        content: "We do not sell personal information. Data may only be shared when legally required or necessary for service delivery."
    },
    {
        title: "8. User Rights",
        content: "Users may request access, correction, or deletion of their personal information."
    },
    {
        title: "9. Children's Privacy",
        content: "Our services are not intended for children under 13 years of age."
    },
    {
        title: "10. Policy Updates",
        content: "We may update this Privacy Policy from time to time."
    },
    {
        title: "11. Contact",
        content: "For privacy concerns, contact support@yourdomain.com."
    }
]

function PrivacyPolicy() {
    const navigate = useNavigate()

    return (
        <div className='relative min-h-screen overflow-hidden bg-[#050505] text-white px-6 pt-16 pb-24'>

            {/* Background glows */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px]' />
                <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px]' />
                <div className='absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[160px]' />
            </div>

            {/* Back button */}
            <button
                className='relative z-10 mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition'
                onClick={() => navigate("/")}
            >
                <ArrowLeft size={16} />
                Back
            </button>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-3xl mx-auto text-center mb-14"
            >
                <div className='inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300'>
                    <Lock size={14} className='text-purple-400' />
                    Your Privacy Matters
                </div>
                <h1 className='text-4xl md:text-5xl font-bold mb-4'>
                    Privacy <span className='bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>Policy</span>
                </h1>
                <p className='text-zinc-400 text-lg'>
                    At LIXA AI, we value your privacy and are committed to protecting your information.
                </p>
            </motion.div>

            {/* Content sections */}
            <div className='relative z-10 max-w-3xl mx-auto space-y-6'>
                {sections.map((section, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04 }}
                        className='rounded-2xl p-6 border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-purple-500/30 hover:bg-white/[0.06] transition-all duration-300'
                    >
                        <h2 className='text-lg font-semibold mb-3 text-white'>{section.title}</h2>
                        <p className='text-sm text-zinc-400 leading-relaxed'>{section.content}</p>
                        {section.list && (
                            <ul className='mt-3 space-y-2'>
                                {section.list.map((item, j) => (
                                    <li key={j} className='flex items-start gap-2 text-sm text-zinc-400'>
                                        <span className='mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0' />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className='relative z-10 max-w-3xl mx-auto mt-16 pt-8 border-t border-white/10 text-center'
            >
                <p className='text-sm text-zinc-500'>
                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <div className='mt-4 flex justify-center gap-6 text-sm'>
                    <Link to="/terms" className='text-zinc-400 hover:text-purple-400 transition'>Terms & Conditions</Link>
                    <Link to="/pricing" className='text-zinc-400 hover:text-purple-400 transition'>Pricing</Link>
                    <Link to="/" className='text-zinc-400 hover:text-purple-400 transition'>Home</Link>
                </div>
                <p className='mt-6 text-xs text-zinc-600'>&copy; {new Date().getFullYear()} LIXA AI. All rights reserved.</p>
            </motion.div>
        </div>
    )
}

export default PrivacyPolicy
