import React, { useEffect, useState } from 'react'
import { 
    ArrowLeft, Check, Rocket, Share2, Home as HomeIcon, Globe, 
    Sparkles, LayoutTemplate, Link as LinkIcon, FolderOpen, 
    Settings as SettingsIcon, CreditCard, LogOut, CheckCircle, 
    Search, Plus, User, AlertCircle, Menu, X, Coins, ExternalLink, RefreshCw 
} from 'lucide-react'
import { motion, AnimatePresence } from "motion/react"
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import dashboardBg from '../assets/dashboard-bg.png'
import { setUserData } from '../redux/userSlice'
import lixaLogo from '../assets/lixa-logo.png'

const STARTER_TEMPLATES = [
    {
        id: "portfolio",
        title: "Minimalist Portfolio",
        description: "A sleek, dark-themed portfolio for developers and designers with smooth micro-animations.",
        category: "design",
        prompt: "Create a stunning minimalist personal portfolio website for a creative designer/developer. Use a dark mode theme with neon accents, dynamic scroll animations, a project grid with hover zoom effects, a clean experience timeline, and a floating contact form with glassmorphism styling."
    },
    {
        id: "saas",
        title: "SaaS Landing Page",
        description: "Modern landing page for tech startups with feature lists, testimonials, and dynamic pricing cards.",
        category: "design",
        prompt: "Design a high-converting SaaS landing page for an AI productivity tool. Include a header with smooth transitions, a hero section with gradient text and call to action buttons, a dynamic features grid with custom icons, interactive testimonials carousel, and premium subscription pricing tables."
    },
    {
        id: "agency",
        title: "Creative Agency Page",
        description: "Showcase agency projects with modern grids, typography, and team member hover states.",
        category: "animation",
        prompt: "Create a modern creative agency landing page. It should feature bold typography, smooth scrolling animations, an interactive grid showing agency client work with rich details on hover, a team section, and an eye-catching interactive FAQ accordion."
    },
    {
        id: "app-promo",
        title: "Mobile App Showcase",
        description: "Clean app showcase landing page with mockup placeholders, feature callouts, and download buttons.",
        category: "app",
        prompt: "Build an interactive app promotion landing page for a mobile fitness tracking app. Include standard app device mockups, a key features section with custom metric charts, a testimonials section, and download badge buttons (App Store & Play Store) with hover effects."
    },
    {
        id: "3d-product",
        title: "3D Product Landing Page",
        description: "Immersive landing page layout optimized for products, featuring card structures and clean product galleries.",
        category: "3d",
        prompt: "Create an immersive landing page for premium mechanical keyboards. Include high-quality CSS layouts, hover states, interactive features breakdown, custom configuration options, and a beautiful pricing/buy section."
    },
    {
        id: "ecommerce",
        title: "E-Commerce Landing Page",
        description: "Product catalog grid with categories, rating badges, search box, and custom checkout button styling.",
        category: "design",
        prompt: "Build a modern e-commerce landing page for an organic skin care brand. Feature a clean pastel color theme, a top product banner, search filter chips, product cards showing price and star ratings, a shop category grid, and an interactive shopping cart drawer mockup."
    }
];

const BILLING_PLANS = [
    {
        key: "free",
        name: "Free",
        price: "₹0",
        credits: 100,
        description: "Perfect to explore LIXA AI",
        features: ["AI website generation", "Responsive HTML output", "Basic animations"],
        popular: false
    },
    {
        key: "pro",
        name: "Pro",
        price: "₹499",
        credits: 500,
        description: "For serious creators & freelancers",
        features: ["Everything in Free", "Faster generation", "Edit & regenerate"],
        popular: true
    },
    {
        key: "enterprise",
        name: "Enterprise",
        price: "₹1499",
        credits: 1000,
        description: "For teams & power users",
        features: ["Everything in Pro", "Highest priority generation", "Dedicated support"],
        popular: false
    }
];

function Dashboard() {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    
    const [websites, setWebsites] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [copiedId, setCopiedId] = useState(null)
    const [activeTab, setActiveTab] = useState("my-websites")
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab)
        }
    }, [location])

    // Domain Checker State
    const [domainInput, setDomainInput] = useState("")
    const [domainStatus, setDomainStatus] = useState(null)
    const [checkingDomain, setCheckingDomain] = useState(false)
    const [userDomains, setUserDomains] = useState([
        { domain: `${userData?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}.lixa.ai`, type: "System Subdomain", status: "Active", ssl: "Active" }
    ])

    // Settings State
    const [newName, setNewName] = useState(userData?.name || "")
    const [editingName, setEditingName] = useState(false)
    const [settingsSuccess, setSettingsSuccess] = useState("")

    // Project view filter
    const [projectSearch, setProjectSearch] = useState("")

    // Billing purchasing state
    const [purchasingPlan, setPurchasingPlan] = useState(null)

    // Load websites
    const handleGetAllWebsites = async () => {
        setLoading(true)
        try {
            const result = await axios.get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
            setWebsites(result.data || [])
            setLoading(false)
        } catch (error) {
            console.log(error)
            setError(error.response?.data?.message || "Failed to load websites")
            setLoading(false)
        }
    }

    useEffect(() => {
        handleGetAllWebsites()
    }, [])

    const handleDeploy = async (id) => {
        try {
            const result = await axios.get(`${serverUrl}/api/website/deploy/${id}`, { withCredentials: true })
            window.open(`${result.data.url}`, "_blank")
            setWebsites((prev) =>
                prev.map((w) =>
                    w._id === id
                        ? { ...w, deployed: true, deployUrl: result.data.url }
                        : w
                )
            );
        } catch (error) {
            console.log(error)
        }
    }

    const handleCopy = async (site) => {
        await navigator.clipboard.writeText(site.deployUrl)
        setCopiedId(site._id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
            dispatch(setUserData(null))
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    const handleUpdateName = () => {
        if (!newName.trim()) return
        dispatch(setUserData({ ...userData, name: newName }))
        setEditingName(false)
        setSettingsSuccess("Profile name updated successfully!")
        setTimeout(() => setSettingsSuccess(""), 3000)
    }

    const handleCheckDomain = () => {
        if (!domainInput.trim()) return
        setCheckingDomain(true)
        setDomainStatus(null)
        setTimeout(() => {
            const cleanDomain = domainInput.trim().toLowerCase()
            const isAvailable = !cleanDomain.includes("lixa") && !cleanDomain.includes("google") && !cleanDomain.includes("facebook") && cleanDomain.includes(".")
            setDomainStatus({
                domain: cleanDomain,
                available: isAvailable,
                price: isAvailable ? "₹699/year" : null
            })
            setCheckingDomain(false)
        }, 1000)
    }

    const handleConnectDomain = (domainName) => {
        setUserDomains(prev => [
            ...prev,
            { domain: domainName, type: "Custom Domain", status: "Pending Configuration", ssl: "Inactive" }
        ])
        setDomainInput("")
        setDomainStatus(null)
    }

    const handleBuy = async (planKey) => {
        if (!userData) {
            navigate("/")
            return
        }
        if (planKey === "free") {
            setActiveTab("my-websites")
            return
        }
        setPurchasingPlan(planKey)
        try {
            const result = await axios.post(`${serverUrl}/api/billing/create-order`, { planType: planKey }, { withCredentials: true })
            const data = result.data

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
                            const planDetails = BILLING_PLANS.find(p=>p.key===planKey)
                            dispatch(setUserData({...userData, credits: userData.credits + planDetails.credits, plan: planKey}))
                            setSettingsSuccess(`Successfully upgraded to ${planKey.toUpperCase()} plan!`)
                            setTimeout(() => setSettingsSuccess(""), 4000)
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
                    color: "#e63946"
                }
            };
            
            if (!window.Razorpay) {
                alert("Razorpay SDK failed to load. Please do a hard refresh of the page (Ctrl + Shift + R).")
                setPurchasingPlan(null)
                return
            }

            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', function (response){
                alert("Payment failed: " + response.error.description)
            })
            rzp.open()
            setPurchasingPlan(null)

        } catch (error) {
            console.log(error)
            alert("Error: " + (error.response?.data?.message || error.message))
            setPurchasingPlan(null)
        }
    }

    const sidebarItems = [
        { id: 'home', label: 'Home', icon: HomeIcon },
        { id: 'my-websites', label: 'My Websites', icon: Globe },
        { id: 'ai-generator', label: 'AI Generator', icon: Sparkles, redirect: true, path: '/generate' },
        { id: 'templates', label: 'Templates', icon: LayoutTemplate },
        { id: 'domains', label: 'Domains', icon: LinkIcon },
        { id: 'project', label: 'Project', icon: FolderOpen },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ]

    const handleSidebarClick = (item) => {
        setMobileMenuOpen(false)
        if (item.redirect) {
            navigate(item.path)
        } else {
            setActiveTab(item.id)
        }
    }

    // Filtered Websites for Project tab
    const filteredWebsites = websites?.filter(w => 
        w.title.toLowerCase().includes(projectSearch.toLowerCase())
    ) || []

    return (
        <div 
            className='min-h-screen text-white bg-cover bg-center bg-no-repeat bg-fixed flex flex-col md:flex-row'
            style={{ backgroundImage: `url(${dashboardBg})` }}
        >
            {/* Top Navigation for Mobile Screens */}
            <div className='md:hidden w-full backdrop-blur-xl bg-black/60 border-b border-white/10 px-6 h-16 flex items-center justify-between sticky top-0 z-50'>
                <div className='flex items-center gap-3'>
                    <img src={`https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=e63946&color=fff`} className='w-8 h-8 rounded-full border border-white/20' alt="" />
                    <span className='font-semibold text-sm truncate max-w-[120px]'>{userData?.name}</span>
                </div>
                <div className='flex items-center gap-4'>
                    <button 
                        onClick={() => navigate("/generate")}
                        className='px-3 py-1.5 rounded-lg bg-[#e63946] text-white text-xs font-semibold hover:bg-red-600 transition flex items-center gap-1'
                    >
                        <Sparkles size={12} />
                        New
                    </button>
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className='p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-white'
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Slide-over Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.2 }}
                        className='fixed inset-0 top-16 bg-black/95 backdrop-blur-2xl z-40 md:hidden flex flex-col justify-between p-6'
                    >
                        <div className='flex flex-col gap-2'>
                            {sidebarItems.map((item) => {
                                const Icon = item.icon
                                const isActive = activeTab === item.id
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSidebarClick(item)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                                            isActive 
                                                ? 'bg-[#e63946] text-white shadow-lg shadow-red-500/20' 
                                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </button>
                                )
                            })}
                        </div>

                        <div className='border-t border-white/10 pt-6 flex flex-col gap-4'>
                            <div className='flex items-center justify-between text-sm text-zinc-400'>
                                <span>Credits Remaining:</span>
                                <span className='font-bold text-white flex items-center gap-1'>
                                    <Coins size={14} className='text-yellow-500' />
                                    {userData?.credits || 0}
                                </span>
                            </div>
                            <button 
                                onClick={handleLogOut}
                                className='w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2'
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persistent Sidebar for Desktop Screens */}
            <aside className='hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-black/55 backdrop-blur-2xl border-r border-white/10 p-6 z-30 justify-between'>
                <div className='flex flex-col gap-8'>
                    {/* Header */}
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate("/")}>
                            <img src={lixaLogo} alt="LIXA AI" className='h-10 w-auto' style={{mixBlendMode: 'screen'}} />
                            <span className='font-bold tracking-wider text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300'>LIXA AI</span>
                        </div>
                        <button className='p-1.5 rounded-lg hover:bg-white/10 transition text-zinc-400 hover:text-white' onClick={() => navigate("/")}>
                            <ArrowLeft size={16} />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className='flex flex-col gap-1.5'>
                        {sidebarItems.map((item) => {
                            const Icon = item.icon
                            const isActive = activeTab === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleSidebarClick(item)}
                                    className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-medium transition-all ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-[#e63946] to-red-500 text-white shadow-lg shadow-red-500/25 scale-[1.02]' 
                                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'} />
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer Account Details */}
                <div className='flex flex-col gap-4 border-t border-white/10 pt-5'>
                    <div className='flex items-center gap-3 p-1.5 rounded-xl bg-white/5 border border-white/5'>
                        <img 
                            src={userData?.avatar || `https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=e63946&color=fff`} 
                            className='w-9 h-9 rounded-full border border-white/10 shadow-sm' 
                            alt={userData?.name} 
                        />
                        <div className='flex-1 min-w-0'>
                            <p className='text-xs font-semibold truncate text-white'>{userData?.name}</p>
                            <p className='text-[10px] text-zinc-400 truncate'>{userData?.email}</p>
                        </div>
                    </div>

                    <div className='flex items-center justify-between text-xs px-1 text-zinc-400'>
                        <span className='flex items-center gap-1'>
                            <Coins size={12} className='text-yellow-500' />
                            Credits
                        </span>
                        <span className='font-bold text-white'>{userData?.credits || 0}</span>
                    </div>

                    <button 
                        onClick={handleLogOut}
                        className='w-full py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition duration-200 text-zinc-400 text-xs font-semibold flex items-center justify-center gap-2 border border-white/5 hover:border-red-500/20'
                    >
                        <LogOut size={12} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Panel Content Area */}
            <main className='flex-1 min-h-[calc(100vh-4rem)] md:h-screen overflow-y-auto px-6 py-8 md:px-10 md:py-10 relative z-10'>
                {settingsSuccess && (
                    <div className='fixed top-6 right-6 z-50 bg-emerald-500 text-white px-4 py-3 rounded-xl border border-emerald-400/20 shadow-xl flex items-center gap-2 text-sm'>
                        <CheckCircle size={16} />
                        {settingsSuccess}
                    </div>
                )}

                {/* Tabs Rendering */}

                {/* 1. HOME TAB */}
                {activeTab === "home" && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className='space-y-8 max-w-6xl'>
                        <div>
                            <p className='text-sm text-zinc-400 mb-1'>Welcome Back,</p>
                            <h1 className='text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400'>{userData?.name}</h1>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                            <div className='p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition'>
                                <div className='p-3 bg-red-500/10 text-red-400 rounded-xl'><Globe size={24} /></div>
                                <div>
                                    <p className='text-xs text-zinc-400 font-medium'>Total Websites</p>
                                    <h3 className='text-2xl font-bold mt-0.5'>{websites ? websites.length : 0}</h3>
                                </div>
                            </div>
                            <div className='p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition'>
                                <div className='p-3 bg-yellow-500/10 text-yellow-400 rounded-xl'><Coins size={24} /></div>
                                <div>
                                    <p className='text-xs text-zinc-400 font-medium'>Credits Available</p>
                                    <h3 className='text-2xl font-bold mt-0.5'>{userData?.credits || 0}</h3>
                                </div>
                            </div>
                            <div className='p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition'>
                                <div className='p-3 bg-indigo-500/10 text-indigo-400 rounded-xl'><Sparkles size={24} /></div>
                                <div>
                                    <p className='text-xs text-zinc-400 font-medium'>Active Plan</p>
                                    <h3 className='text-2xl font-bold mt-0.5 capitalize'>{userData?.plan || 'Free'}</h3>
                                </div>
                            </div>
                            <div className='p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition'>
                                <div className='p-3 bg-emerald-500/10 text-emerald-400 rounded-xl'><LinkIcon size={24} /></div>
                                <div>
                                    <p className='text-xs text-zinc-400 font-medium'>Custom Domains</p>
                                    <h3 className='text-2xl font-bold mt-0.5'>{userDomains.length}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Call To Actions */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='p-8 rounded-3xl bg-gradient-to-br from-[#e63946]/20 to-transparent border border-red-500/20 flex flex-col justify-between h-56 hover:border-red-500/35 transition'>
                                <div>
                                    <h2 className='text-xl font-bold mb-2'>Create New AI Website</h2>
                                    <p className='text-zinc-400 text-sm leading-relaxed'>Generate a custom, production-ready response-adaptive web layout containing modern styling in seconds.</p>
                                </div>
                                <button 
                                    onClick={() => navigate("/generate")}
                                    className='px-5 py-3 rounded-xl bg-linear-to-r from-[#e63946] to-red-500 hover:scale-[1.02] text-white font-semibold text-sm transition flex items-center gap-2 self-start'
                                >
                                    <Sparkles size={16} />
                                    Launch AI Builder
                                </button>
                            </div>

                            <div className='p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex flex-col justify-between h-56 hover:bg-white/10 transition'>
                                <div>
                                    <h2 className='text-xl font-bold mb-2'>Explore Premium Templates</h2>
                                    <p className='text-zinc-400 text-sm leading-relaxed'>Skip the prompt formulation stage and start immediately using one of our verified, industry-tailored website starter templates.</p>
                                </div>
                                <button 
                                    onClick={() => setActiveTab("templates")}
                                    className='px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition flex items-center gap-2 self-start border border-white/10'
                                >
                                    <LayoutTemplate size={16} />
                                    Browse Templates
                                </button>
                            </div>
                        </div>

                        {/* Recent Projects List snippet */}
                        <div className='p-6 rounded-2xl bg-white/5 border border-white/10'>
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className='font-bold text-lg'>Recent Websites</h3>
                                <button onClick={() => setActiveTab("my-websites")} className='text-xs text-[#e63946] hover:underline font-semibold flex items-center gap-1'>
                                    View All <Plus size={12} />
                                </button>
                            </div>
                            {!websites ? (
                                <p className='text-zinc-400 text-sm'>Loading your sites...</p>
                            ) : websites.length === 0 ? (
                                <p className='text-zinc-400 text-sm'>You have no websites created yet.</p>
                            ) : (
                                <div className='divide-y divide-white/5'>
                                    {websites.slice(0, 3).map((site) => (
                                        <div key={site._id} className='py-3.5 flex items-center justify-between text-sm group'>
                                            <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate(`/editor/${site._id}`)}>
                                                <div className='w-2 h-2 rounded-full bg-emerald-500'></div>
                                                <span className='font-medium group-hover:text-[#e63946] transition'>{site.title}</span>
                                            </div>
                                            <div className='flex items-center gap-4 text-xs text-zinc-400'>
                                                <span>Updated {new Date(site.updatedAt).toLocaleDateString()}</span>
                                                <button 
                                                    onClick={() => navigate(`/editor/${site._id}`)}
                                                    className='text-white hover:text-[#e63946] font-semibold'
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* 2. MY WEBSITES TAB */}
                {activeTab === "my-websites" && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className='space-y-6'>
                        <div className='flex items-center justify-between mb-2'>
                            <div>
                                <h1 className='text-2xl md:text-3xl font-bold'>My Websites</h1>
                                <p className='text-sm text-zinc-400 mt-1'>Manage, edit, deploy and share your AI generated sites</p>
                            </div>
                            <button 
                                className='px-4 py-2 rounded-xl bg-[#e63946] text-white text-sm font-semibold hover:scale-105 transition flex items-center gap-2' 
                                onClick={() => navigate("/generate")}
                            >
                                <Plus size={16} /> New Website
                            </button>
                        </div>

                        {loading && (
                            <div className="mt-24 text-center text-zinc-400 flex flex-col items-center gap-3">
                                <RefreshCw size={24} className="animate-spin text-zinc-400" />
                                <span>Loading your websites...</span>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="mt-24 text-center text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl max-w-md mx-auto">{error}</div>
                        )}

                        {websites?.length === 0 && !loading && (
                            <div className="mt-24 text-center bg-white/5 border border-white/10 p-10 rounded-2xl max-w-md mx-auto">
                                <Globe size={40} className='mx-auto text-zinc-500 mb-4' />
                                <h3 className='font-bold text-lg mb-1'>No websites found</h3>
                                <p className='text-zinc-400 text-sm mb-6'>Get started by building your first website using our AI builder.</p>
                                <button className='px-4 py-2 rounded-xl bg-white text-black font-semibold text-sm hover:scale-105 transition' onClick={() => navigate("/generate")}>
                                    Generate website
                                </button>
                            </div>
                        )}

                        {!loading && !error && websites?.length > 0 && (
                            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
                                {websites.map((w, i) => {
                                    const copied = copiedId === w._id
                                    return (
                                        <motion.div
                                            key={w._id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            whileHover={{ y: -5 }}
                                            className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 flex flex-col group shadow-lg"
                                        >
                                            <div className='relative h-44 bg-zinc-950 cursor-pointer overflow-hidden border-b border-white/5' onClick={() => navigate(`/editor/${w._id}`)}>
                                                <iframe 
                                                    srcDoc={w.latestCode} 
                                                    className='absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white' 
                                                    title={w.title}
                                                />
                                                <div className='absolute inset-0 bg-black/40 group-hover:bg-black/25 transition duration-300' />
                                                <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50'>
                                                    <span className='px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-md'>Open Editor</span>
                                                </div>
                                            </div>

                                            <div className='p-5 flex flex-col gap-4 flex-1 justify-between'>
                                                <div>
                                                    <h3 className='text-base font-semibold line-clamp-1 group-hover:text-[#e63946] transition'>{w.title}</h3>
                                                    <p className='text-xs text-zinc-400 mt-1.5'>Last Updated: {new Date(w.updatedAt).toLocaleDateString()}</p>
                                                </div>

                                                <div className='flex gap-2.5 mt-2'>
                                                    {!w.deployed ? (
                                                        <button 
                                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-500 to-indigo-600 hover:opacity-90 transition"
                                                            onClick={() => handleDeploy(w._id)}
                                                        >
                                                            <Rocket size={13} /> Deploy Site
                                                        </button>
                                                    ) : (
                                                        <motion.button
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleCopy(w)}
                                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                                copied
                                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                                    : "bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                                                            }`}
                                                        >
                                                            {copied ? (
                                                                <>
                                                                    <Check size={12} /> Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Share2 size={12} /> Copy Link
                                                                </>
                                                            )}
                                                        </motion.button>
                                                    )}
                                                    {w.deployed && (
                                                        <a 
                                                            href={w.deployUrl} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className='p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-zinc-300 hover:text-white'
                                                        >
                                                            <ExternalLink size={13} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 4. TEMPLATES TAB */}
                {activeTab === "templates" && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className='space-y-6'>
                        <div>
                            <h1 className='text-2xl md:text-3xl font-bold'>Starter Templates</h1>
                            <p className='text-sm text-zinc-400 mt-1'>Generate websites quickly using custom pre-structured models</p>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {STARTER_TEMPLATES.map((tmpl) => (
                                <div key={tmpl.id} className='rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all duration-300 shadow-lg'>
                                    <div className='p-6'>
                                        <span className='text-[10px] uppercase font-bold tracking-widest bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20'>{tmpl.category}</span>
                                        <h3 className='font-bold text-lg mt-4 group-hover:text-[#e63946] transition'>{tmpl.title}</h3>
                                        <p className='text-zinc-400 text-sm mt-2 leading-relaxed line-clamp-3'>{tmpl.description}</p>
                                    </div>
                                    <div className='p-6 border-t border-white/5 bg-black/10'>
                                        <button 
                                            onClick={() => navigate("/generate", { state: { prompt: tmpl.prompt, category: tmpl.category } })}
                                            className='w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 hover:scale-[1.01] transition flex items-center justify-center gap-1.5'
                                        >
                                            <Sparkles size={13} /> Use Template
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 5. DOMAINS TAB */}
                {activeTab === "domains" && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className='space-y-8 max-w-4xl'>
                        <div>
                            <h1 className='text-2xl md:text-3xl font-bold'>Custom Domains</h1>
                            <p className='text-sm text-zinc-400 mt-1'>Connect custom web domains to your generated sites</p>
                        </div>

                        {/* Domain Search Card */}
                        <div className='p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10'>
                            <h2 className='font-bold text-lg mb-3'>Search Custom Domain</h2>
                            <p className='text-zinc-400 text-sm mb-5 leading-relaxed'>Connect your own domain to brand your creations. Check availability below.</p>
                            
                            <div className='flex flex-col sm:flex-row gap-3'>
                                <div className='relative flex-1'>
                                    <input 
                                        type="text" 
                                        value={domainInput}
                                        onChange={(e) => setDomainInput(e.target.value)}
                                        placeholder="Enter domain name (e.g., mybrand.com)"
                                        className='w-full px-4.5 py-3 rounded-xl bg-black/40 border border-white/20 outline-none text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all'
                                    />
                                </div>
                                <button 
                                    onClick={handleCheckDomain}
                                    disabled={checkingDomain || !domainInput.trim()}
                                    className='px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md'
                                >
                                    {checkingDomain ? (
                                        <>
                                            <RefreshCw size={15} className='animate-spin' /> Searching...
                                        </>
                                    ) : "Check Availability"}
                                </button>
                            </div>

                            {/* Search Results */}
                            {domainStatus && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className='mt-5 p-4.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20 border-white/10'>
                                    <div>
                                        <p className='text-sm font-semibold flex items-center gap-1.5'>
                                            <span className='font-bold text-white'>{domainStatus.domain}</span>
                                            {domainStatus.available ? (
                                                <span className='text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20'>Available</span>
                                            ) : (
                                                <span className='text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20'>Taken</span>
                                            )}
                                        </p>
                                        {domainStatus.available && <p className='text-xs text-zinc-400 mt-1'>Price: {domainStatus.price} (includes FREE SSL certificate)</p>}
                                    </div>
                                    {domainStatus.available && (
                                        <button 
                                            onClick={() => handleConnectDomain(domainStatus.domain)}
                                            className='px-4.5 py-2 rounded-lg bg-[#e63946] text-white text-xs font-semibold hover:bg-red-600 transition shadow-sm'
                                        >
                                            Connect Domain
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {/* Connected Domains list */}
                        <div className='p-6 rounded-2xl bg-white/5 border border-white/10'>
                            <h2 className='font-bold text-lg mb-4'>Your Active Domains</h2>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left text-sm text-zinc-300 min-w-[500px]'>
                                    <thead>
                                        <tr className='border-b border-white/10 text-zinc-400 font-medium text-xs'>
                                            <th className='pb-3'>Domain</th>
                                            <th className='pb-3'>Type</th>
                                            <th className='pb-3'>Status</th>
                                            <th className='pb-3'>SSL Secure</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-white/5'>
                                        {userDomains.map((d, index) => (
                                            <tr key={index} className='text-xs'>
                                                <td className='py-3.5 font-semibold text-white'>{d.domain}</td>
                                                <td className='py-3.5'>{d.type}</td>
                                                <td className='py-3.5'>
                                                    <span className={`px-2 py-0.5 rounded-full ${
                                                        d.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse"
                                                    }`}>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className='py-3.5'>
                                                    <span className={`flex items-center gap-1 ${d.ssl === "Active" ? "text-emerald-400" : "text-zinc-500"}`}>
                                                        <CheckCircle size={12} /> {d.ssl}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* DNS Config help */}
                        <div className='p-6 rounded-2xl bg-black/40 border border-white/5'>
                            <h3 className='font-bold text-sm flex items-center gap-2 text-zinc-200 mb-2.5'>
                                <AlertCircle size={16} className='text-zinc-400' />
                                How to configure custom domain DNS records
                            </h3>
                            <p className='text-xs text-zinc-400 leading-relaxed mb-4'>
                                Point your domain from your domain registrar (GoDaddy, Namecheap, Google Domains) to our servers by configuration mapping:
                            </p>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono'>
                                <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
                                    <p className='text-zinc-400 mb-1 text-[10px] uppercase font-bold tracking-wider'>A Record (Root domain)</p>
                                    <p className='text-white mt-1'>Host: <span className='text-red-400'>@</span></p>
                                    <p className='text-white'>Value: <span className='text-red-400'>76.76.21.21</span></p>
                                </div>
                                <div className='p-3 bg-white/5 rounded-lg border border-white/10'>
                                    <p className='text-zinc-400 mb-1 text-[10px] uppercase font-bold tracking-wider'>CNAME Record (Subdomain)</p>
                                    <p className='text-white mt-1'>Host: <span className='text-red-400'>www</span></p>
                                    <p className='text-white'>Value: <span className='text-red-400'>cname.lixa.ai</span></p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 6. PROJECT TAB */}
                {activeTab === "project" && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className='space-y-6'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                            <div>
                                <h1 className='text-2xl md:text-3xl font-bold'>Project Analytics</h1>
                                <p className='text-sm text-zinc-400 mt-1'>Overall overview metrics of website builds</p>
                            </div>
                            <div className='relative w-full sm:w-64'>
                                <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500' size={16} />
                                <input 
                                    type="text" 
                                    value={projectSearch}
                                    onChange={(e) => setProjectSearch(e.target.value)}
                                    placeholder="Search project name..."
                                    className='w-full pl-9 px-4.5 py-2.5 rounded-xl bg-black/40 border border-white/20 outline-none text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-white'
                                />
                            </div>
                        </div>

                        {/* Project overview metrics */}
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
                            <div className='p-5 rounded-xl bg-white/5 border border-white/10'>
                                <p className='text-xs text-zinc-400'>Published & Live Projects</p>
                                <h3 className='text-2xl font-bold mt-1 text-emerald-400'>
                                    {websites ? websites.filter(w => w.deployed).length : 0}
                                </h3>
                            </div>
                            <div className='p-5 rounded-xl bg-white/5 border border-white/10'>
                                <p className='text-xs text-zinc-400'>Draft Projects</p>
                                <h3 className='text-2xl font-bold mt-1 text-zinc-300'>
                                    {websites ? websites.filter(w => !w.deployed).length : 0}
                                </h3>
                            </div>
                            <div className='p-5 rounded-xl bg-white/5 border border-white/10'>
                                <p className='text-xs text-zinc-400'>Project Host Storage</p>
                                <h3 className='text-2xl font-bold mt-1 text-red-400'>
                                    {websites ? (websites.length * 0.45).toFixed(2) : 0} MB
                                </h3>
                            </div>
                        </div>

                        {/* List grid view */}
                        <div className='p-6 rounded-2xl bg-white/5 border border-white/10'>
                            <h2 className='font-bold text-lg mb-4'>All Projects</h2>
                            {filteredWebsites.length === 0 ? (
                                <p className='text-sm text-zinc-400 py-6 text-center'>No projects match your search.</p>
                            ) : (
                                <div className='overflow-x-auto'>
                                    <table className='w-full text-left text-sm text-zinc-300 min-w-[550px]'>
                                        <thead>
                                            <tr className='border-b border-white/10 text-zinc-400 font-medium text-xs'>
                                                <th className='pb-3'>Project Name</th>
                                                <th className='pb-3'>Status</th>
                                                <th className='pb-3'>Size Estimate</th>
                                                <th className='pb-3'>Hosting Host</th>
                                                <th className='pb-3 text-right'>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-white/5'>
                                            {filteredWebsites.map((site) => (
                                                <tr key={site._id} className='text-xs group hover:bg-white/5 transition-colors'>
                                                    <td className='py-3.5 font-semibold text-white'>
                                                        <span className='cursor-pointer hover:text-[#e63946] transition' onClick={() => navigate(`/editor/${site._id}`)}>
                                                            {site.title}
                                                        </span>
                                                    </td>
                                                    <td className='py-3.5'>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                                            site.deployed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border border-white/10"
                                                        }`}>
                                                            {site.deployed ? "Live" : "Draft"}
                                                        </span>
                                                    </td>
                                                    <td className='py-3.5'>450 KB</td>
                                                    <td className='py-3.5'>{site.deployed ? "LIXA Edge CDN" : "Local draft"}</td>
                                                    <td className='py-3.5 text-right'>
                                                        <button 
                                                            onClick={() => navigate(`/editor/${site._id}`)}
                                                            className='px-3 py-1 rounded-lg bg-white/10 hover:bg-[#e63946] hover:text-white transition font-medium text-[11px]'
                                                        >
                                                            Open Editor
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* 7. SETTINGS TAB */}
                {activeTab === "settings" && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className='space-y-8 max-w-2xl'>
                        <div>
                            <h1 className='text-2xl md:text-3xl font-bold'>Account Settings</h1>
                            <p className='text-sm text-zinc-400 mt-1'>Configure profile settings and security details</p>
                        </div>

                        {/* Profile Info Form */}
                        <div className='p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6'>
                            <h2 className='font-bold text-lg border-b border-white/5 pb-3'>Profile Information</h2>
                            
                            <div className='flex flex-col sm:flex-row gap-6 items-start sm:items-center'>
                                <img 
                                    src={userData?.avatar || `https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=e63946&color=fff`} 
                                    className='w-16 h-16 rounded-full border-2 border-white/20' 
                                    alt="" 
                                />
                                <div className='space-y-1'>
                                    <h3 className='font-semibold text-base'>{userData?.name}</h3>
                                    <p className='text-xs text-zinc-400'>{userData?.email}</p>
                                    <p className='text-[10px] text-zinc-500 uppercase font-bold tracking-wider'>Account Type: {userData?.plan || 'Free'} Member</p>
                                </div>
                            </div>

                            <div className='space-y-4 pt-2'>
                                <div className='flex flex-col gap-2'>
                                    <label className='text-xs text-zinc-400 font-semibold'>Display Name</label>
                                    {editingName ? (
                                        <div className='flex gap-2.5'>
                                            <input 
                                                type="text" 
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className='flex-1 px-4.5 py-2.5 rounded-xl bg-black/40 border border-white/20 outline-none text-xs focus:border-red-500 transition-all text-white'
                                            />
                                            <button 
                                                onClick={handleUpdateName}
                                                className='px-4.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition'
                                            >
                                                Save
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setNewName(userData?.name || "")
                                                    setEditingName(false)
                                                }}
                                                className='px-4.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold transition'
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className='flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs text-zinc-300'>
                                            <span>{userData?.name}</span>
                                            <button 
                                                onClick={() => setEditingName(true)}
                                                className='text-xs text-[#e63946] hover:underline font-semibold'
                                            >
                                                Change Name
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <label className='text-xs text-zinc-400 font-semibold'>Email Address</label>
                                    <input 
                                        type="email" 
                                        value={userData?.email || ""} 
                                        disabled
                                        className='w-full px-4.5 py-3 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-500 cursor-not-allowed'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security settings mock */}
                        <div className='p-6 rounded-2xl bg-white/5 border border-white/10'>
                            <h2 className='font-bold text-lg mb-3'>Session Settings</h2>
                            <p className='text-zinc-400 text-xs mb-5'>Terminate session or sign out of other devices.</p>
                            <button 
                                onClick={handleLogOut}
                                className='px-4.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition flex items-center gap-1.5'
                            >
                                <LogOut size={13} />
                                Sign out of all sessions
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 8. BILLING TAB */}
                {activeTab === "billing" && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className='space-y-8 max-w-5xl'>
                        <div>
                            <h1 className='text-2xl md:text-3xl font-bold'>Billing & Credits</h1>
                            <p className='text-sm text-zinc-400 mt-1'>Manage your account plans, active credits, and transactions</p>
                        </div>

                        {/* Credits balance summary cards */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between h-48'>
                                <div>
                                    <span className='text-[10px] uppercase font-bold tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/25'>Credits Balance</span>
                                    <h3 className='text-3xl font-bold mt-4 flex items-center gap-2'>
                                        <Coins className='text-yellow-500' size={28} />
                                        {userData?.credits || 0}
                                    </h3>
                                    <p className='text-xs text-zinc-400 mt-1.5'>Each web generation prompts cost ~10 credits.</p>
                                </div>
                                <button onClick={() => {
                                    const element = document.getElementById("upgrade-plans-section")
                                    if(element) element.scrollIntoView({ behavior: 'smooth' })
                                }} className='px-4.5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition self-start shadow-md'>
                                    Purchase More Credits
                                </button>
                            </div>

                            <div className='p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between h-48'>
                                <div>
                                    <span className='text-[10px] uppercase font-bold tracking-wider text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/25'>Membership plan</span>
                                    <h3 className='text-3xl font-bold mt-4 capitalize'>{userData?.plan || 'Free'} Member</h3>
                                    <p className='text-xs text-zinc-400 mt-1.5'>Your plan is active and renews automatically.</p>
                                </div>
                                <span className='text-xs text-emerald-400 font-semibold flex items-center gap-1.5'>
                                    <CheckCircle size={14} /> Active & Secured
                                </span>
                            </div>
                        </div>

                        {/* Upgrade Inline Plans Cards */}
                        <div id="upgrade-plans-section" className='space-y-4 pt-4'>
                            <h2 className='font-bold text-lg'>Upgrade Your Plan</h2>
                            <p className='text-sm text-zinc-400 leading-relaxed mb-2'>Choose one of the starter kits below to add credits instantly to your profile account.</p>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                {BILLING_PLANS.map((plan) => (
                                    <div 
                                        key={plan.key} 
                                        className={`p-6 rounded-2xl border flex flex-col justify-between backdrop-blur-md transition-all duration-300 relative bg-black/20 ${
                                            plan.popular 
                                                ? "border-red-500 bg-red-500/5 shadow-lg shadow-red-500/10" 
                                                : "border-white/10 hover:border-red-400"
                                        }`}
                                    >
                                        {plan.popular && (
                                            <span className='absolute top-4 right-4 bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full'>
                                                Popular
                                            </span>
                                        )}
                                        <div>
                                            <h3 className='font-bold text-base'>{plan.name}</h3>
                                            <p className='text-[11px] text-zinc-400 mt-1'>{plan.description}</p>
                                            
                                            <div className='flex items-end gap-1.5 mt-5 mb-4'>
                                                <span className='text-2xl font-bold'>{plan.price}</span>
                                                <span className='text-[10px] text-zinc-400 pb-0.5'>/ one-time</span>
                                            </div>

                                            <p className='text-xs font-semibold text-yellow-400 flex items-center gap-1 mb-5'>
                                                <Coins size={12} /> {plan.credits} Credits
                                            </p>

                                            <ul className='space-y-2 border-t border-white/5 pt-4 mb-6'>
                                                {plan.features.map((f, idx) => (
                                                    <li key={idx} className='text-xs text-zinc-300 flex items-center gap-1.5'>
                                                        <Check size={12} className='text-emerald-400 shrink-0' />
                                                        <span className='truncate'>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button 
                                            disabled={purchasingPlan !== null}
                                            onClick={() => handleBuy(plan.key)}
                                            className={`w-full py-2.5 rounded-xl font-bold text-xs transition duration-200 ${
                                                plan.popular 
                                                    ? "bg-white text-black hover:bg-zinc-200" 
                                                    : "bg-white/10 text-white hover:bg-white/15"
                                            }`}
                                        >
                                            {purchasingPlan === plan.key ? "Redirecting..." : plan.key === "free" ? "Active Plan" : `Buy ${plan.name}`}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Invoice transaction list history */}
                        <div className='p-6 rounded-2xl bg-white/5 border border-white/10'>
                            <h2 className='font-bold text-lg mb-4'>Billing History</h2>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left text-sm text-zinc-300 min-w-[500px]'>
                                    <thead>
                                        <tr className='border-b border-white/10 text-zinc-400 font-medium text-xs'>
                                            <th className='pb-3'>Transaction ID</th>
                                            <th className='pb-3'>Date</th>
                                            <th className='pb-3'>Plan Upgrade</th>
                                            <th className='pb-3'>Amount Paid</th>
                                            <th className='pb-3'>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-white/5'>
                                        <tr className='text-xs'>
                                            <td className='py-3.5 font-mono text-zinc-400'>tx_89324789234</td>
                                            <td className='py-3.5'>{new Date().toLocaleDateString()}</td>
                                            <td className='py-3.5'>Welcome Free Credits</td>
                                            <td className='py-3.5'>₹0</td>
                                            <td className='py-3.5'>
                                                <span className='bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20'>
                                                    Success
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    )
}

export default Dashboard
