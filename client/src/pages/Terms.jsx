import React from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from "motion/react"

const sections = [
    {
        title: "1. Service Description",
        content: "LIXA AI provides AI-powered tools that help users create, customize, and deploy websites."
    },
    {
        title: "2. User Accounts",
        content: "Users are responsible for maintaining the security of their accounts and passwords."
    },
    {
        title: "3. Credits & Subscription Plans",
        content: "Free, Pro, and Enterprise plans may include credits and premium features. Credits are non-transferable and may expire according to plan rules."
    },
    {
        title: "4. Payments",
        content: "Payments are processed securely through Razorpay. All purchases are final unless otherwise required by law."
    },
    {
        title: "5. User Content",
        content: "Users retain ownership of their content but are responsible for ensuring it does not violate laws, copyrights, or third-party rights."
    },
    {
        title: "6. Prohibited Use",
        content: "Users may not:",
        list: [
            "Upload malicious code",
            "Generate illegal content",
            "Attempt to hack or disrupt the platform",
            "Abuse platform resources"
        ]
    },
    {
        title: "7. Intellectual Property",
        content: "The LIXA AI platform, branding, software, and technology remain the property of LIXA AI."
    },
    {
        title: "8. Service Availability",
        content: "We strive for continuous service but do not guarantee uninterrupted availability."
    },
    {
        title: "9. Account Termination",
        content: "We reserve the right to suspend or terminate accounts that violate these terms."
    },
    {
        title: "10. Changes to Terms",
        content: "These terms may be updated periodically. Continued use of the platform indicates acceptance of the updated terms."
    },
    {
        title: "11. Contact",
        content: "For support, contact support@yourdomain.com."
    }
]

function Terms() {
    const navigate = useNavigate()

    return (
        <div className='relative min-h-screen overflow-hidden bg-[#050505] text-white px-6 pt-16 pb-24'>

            {/* Background glows */}
            <div className='absolute inset-0 pointer-events-none'>
                <div className='absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px]' />
                <div className='absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[140px]' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[160px]' />
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
                    <Shield size={14} className='text-indigo-400' />
                    Legal
                </div>
                <h1 className='text-4xl md:text-5xl font-bold mb-4'>
                    Terms & <span className='bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>Conditions</span>
                </h1>
                <p className='text-zinc-400 text-lg'>
                    Welcome to LIXA AI Website Builder. By using our platform, you agree to the following terms.
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
                        className='rounded-2xl p-6 border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300'
                    >
                        <h2 className='text-lg font-semibold mb-3 text-white'>{section.title}</h2>
                        <p className='text-sm text-zinc-400 leading-relaxed'>{section.content}</p>
                        {section.list && (
                            <ul className='mt-3 space-y-2'>
                                {section.list.map((item, j) => (
                                    <li key={j} className='flex items-start gap-2 text-sm text-zinc-400'>
                                        <span className='mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0' />
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
                    <Link to="/privacy-policy" className='text-zinc-400 hover:text-indigo-400 transition'>Privacy Policy</Link>
                    <Link to="/pricing" className='text-zinc-400 hover:text-indigo-400 transition'>Pricing</Link>
                    <Link to="/" className='text-zinc-400 hover:text-indigo-400 transition'>Home</Link>
                </div>
                <p className='mt-6 text-xs text-zinc-600'>&copy; {new Date().getFullYear()} LIXA AI. All rights reserved.</p>
            </motion.div>
        </div>
    )
}

export default Terms
