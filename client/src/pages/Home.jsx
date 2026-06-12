import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import LoginModal from '../components/LoginModal'
import { useDispatch, useSelector } from 'react-redux'
import { Coins, ArrowRight, Star, Hexagon, Circle, Triangle, Square, ChevronDown } from "lucide-react"
import { serverUrl } from '../App'
import axios from 'axios'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'
import lixaLogo from '../assets/lixa-logo.png'

function Home() {
    const highlights = [
        "AI Generated Code",
        "Fully Responsive Layouts",
        "Production Ready Output",
    ]

    const [openLogin, setOpenLogin] = useState(false)
    const { userData } = useSelector(state => state.user)
    const [openProfile, setOpenProfile] = useState(false)
    const [websites, setWebsites] = useState(null)
    const [showHeader, setShowHeader] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowHeader(false);
            } else {
                setShowHeader(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);
    
    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
            dispatch(setUserData(null))
            setOpenProfile(false)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (!userData) return;
        const handleGetAllWebsites = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
                setWebsites(result.data || [])
            } catch (error) {
                console.log(error)
            }
        }
        handleGetAllWebsites()
    }, [userData])

    return (
        <div className='relative min-h-screen bg-[#5A0505] text-zinc-900 overflow-x-hidden font-sans'>
            {/* Navbar */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className='fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/10'
            >
                <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
                    <div className='flex items-center cursor-pointer gap-2' onClick={() => navigate('/')}>
                        <img src={lixaLogo} alt="LIXA AI" className='h-10 w-auto' style={{mixBlendMode: 'screen'}} />
                        <span className='text-2xl font-bold tracking-wide text-white'>LIXA AI</span>
                    </div>
                    
                    <div className='hidden md:flex items-center p-1 rounded-full border border-white/10 bg-black/40 text-sm font-medium text-zinc-300 shadow-sm'>
                        <div 
                            className='flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#4A0505] border border-white/10 text-white cursor-pointer hover:bg-[#5A0505] transition-colors'
                            onClick={() => userData ? navigate("/dashboard") : setOpenLogin(true)}
                        >
                            Features <ChevronDown size={14} className="text-zinc-300" />
                        </div>
                        <span className='px-4 py-1.5 hover:text-white cursor-pointer transition-colors rounded-full hover:bg-white/10' onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it Works</span>
                        <span className='px-4 py-1.5 hover:text-white cursor-pointer transition-colors rounded-full hover:bg-white/10' onClick={() => userData ? navigate("/generate") : setOpenLogin(true)}>Create</span>
                        <span className='px-4 py-1.5 hover:text-white cursor-pointer transition-colors rounded-full hover:bg-white/10' onClick={() => navigate("/pricing")}>Pricing</span>
                        <span className='px-4 py-1.5 hover:text-white cursor-pointer transition-colors rounded-full hover:bg-white/10' onClick={() => userData ? navigate("/dashboard", { state: { activeTab: "settings" } }) : setOpenLogin(true)}>Settings</span>
                    </div>
 
                    <div className='flex items-center gap-5'>
                        <div className='hidden md:inline text-sm font-medium text-zinc-400 hover:text-white cursor-pointer transition-colors'>
                            02.95 PM/10SAI
                        </div>
                        {userData && <div className='hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm cursor-pointer hover:bg-white/10 transition' onClick={() => navigate("/pricing")}>
                            <Coins size={16} className='text-yellow-500' />
                            <span className='text-zinc-300 font-medium'>Credits</span>
                            <span className="font-bold text-white">{userData.credits}</span>
                            <span className='font-semibold text-white'>+</span>
                        </div>}

                        {!userData ? <button className='px-6 py-2.5 rounded-full bg-black text-white hover:bg-zinc-800 text-sm font-medium transition-all shadow-md'
                            onClick={() => setOpenLogin(true)}
                        >
                            Get Started
                        </button>
                            :
                            <div className='relative'>
                                <button className='flex items-center hover:scale-105 transition-transform' onClick={() => setOpenProfile(!openProfile)}>
                                    <img src={userData?.avatar || `https://ui-avatars.com/api/?name=${userData.name}`} alt="" referrerPolicy='no-referrer' className='w-10 h-10 rounded-full border-2 border-white shadow-md object-cover' />
                                </button>
                                <AnimatePresence>
                                    {openProfile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-64 z-50 rounded-2xl bg-white border border-black/10 shadow-2xl overflow-hidden"
                                        >
                                            <div className='px-5 py-4 border-b border-black/5 bg-zinc-50'>
                                                <p className='text-sm font-semibold text-black truncate'>{userData.name}</p>
                                                <p className='text-xs text-zinc-500 truncate mt-0.5'>{userData.email}</p>
                                            </div>

                                            <button className='md:hidden w-full px-5 py-3 flex items-center gap-3 text-sm border-b border-black/5 hover:bg-black/5 transition-colors'>
                                                <Coins size={16} className='text-yellow-500' />
                                                <span className='text-zinc-600 font-medium'>Credits</span>
                                                <span className="font-bold text-black ml-auto">{userData.credits}</span>
                                            </button>

                                            <div className="py-2">
                                                <button className='w-full px-5 py-2.5 text-left text-sm font-medium text-zinc-700 hover:bg-black/5 hover:text-black transition-colors' onClick={() => navigate("/dashboard")}>Dashboard</button>
                                                <button className='w-full px-5 py-2.5 text-left text-sm font-medium text-[#e63946] hover:bg-red-50 transition-colors' onClick={handleLogOut}>Logout</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        }
                    </div>
                </div>
            </motion.div>

            {/* New Hero Section */}
            <section className='relative pt-40 pb-20 px-6 min-h-[85vh] flex items-center bg-black overflow-hidden'>
                {/* Background Video */}
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                >
                    <source src="https://res.cloudinary.com/dh0qmflg7/video/upload/v1781236662/ANIMATED_ROBOAT_DIGRI_wlvczy.mp4" type="video/mp4" />
                </video>
                <div className='max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 w-full items-center relative z-10'>
                    {/* Left Column */}
                    <div className="flex-1 w-full relative z-10">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 mb-8"
                        >
                            <div className="flex -space-x-1">
                                <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center text-blue-400"><Hexagon size={14}/></div>
                                <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-green-500/20 backdrop-blur-sm flex items-center justify-center text-green-400"><Circle size={14}/></div>
                            </div>
                            <span className="text-xs font-semibold text-zinc-300 tracking-widest uppercase ml-2">Technological Connection<br/><span className="text-[10px] text-zinc-400">Research & Ideas</span></span>
                        </motion.div>
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-6xl md:text-[5.5rem] lg:text-[6.5rem] leading-[0.95] tracking-[-0.03em] text-[#e63946]"
                        >
                            <span className="font-extrabold italic">Build Stunning</span><br />
                            <span className="font-extrabold italic">Websites</span><br />
                            <span className='font-serif italic font-light tracking-normal text-white'>with AI</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className='mt-8 max-w-lg text-zinc-300 text-xl leading-relaxed font-light'
                        >
                            We create clear intuitive, and accessible digital experiences shaped by real human behavior.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-8 mt-12"
                        >
                            <button 
                                className="inline-flex items-center justify-center gap-4 px-8 py-4 rounded-full bg-[#e63946] text-white font-medium hover:bg-[#d62828] hover:scale-105 transition-all shadow-xl shadow-red-500/20 text-lg group"
                                onClick={() => userData ? navigate("/dashboard") : setOpenLogin(true)}
                            >
                                {userData ? "Go to dashboard" : "Get started"}
                                <div className="bg-white text-[#e63946] rounded-full p-1.5 group-hover:translate-x-1 transition-transform">
                                    <ArrowRight size={18} strokeWidth={3} />
                                </div>
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-4">
                                    <img src="https://ui-avatars.com/api/?name=User1&background=e63946&color=fff" className="w-12 h-12 rounded-full border-[3px] border-black shadow-sm z-30" alt="User" />
                                    <img src="https://ui-avatars.com/api/?name=User2&background=023e8a&color=fff" className="w-12 h-12 rounded-full border-[3px] border-black shadow-sm z-20" alt="User" />
                                    <img src="https://ui-avatars.com/api/?name=User3&background=fb8500&color=fff" className="w-12 h-12 rounded-full border-[3px] border-black shadow-sm z-10" alt="User" />
                                </div>
                                <div className="text-sm">
                                    <div className="flex items-center gap-1 text-white font-bold mb-0.5">
                                        <Star size={16} fill="currentColor" className="text-yellow-400" />
                                        <span>4.9</span>
                                        <span className="text-zinc-400 font-normal ml-1">Reviews</span>
                                    </div>
                                    <span className="text-zinc-400 text-xs">from 15k+ clients</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column / Cards */}
                    <div className="flex-1 w-full relative pt-10 lg:pt-0">
                        <div className="grid grid-cols-2 gap-5 md:gap-8">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="bg-gradient-to-br from-[#f26419]/90 to-[#d65108]/90 backdrop-blur-md rounded-[2rem] p-6 md:p-8 text-white h-56 md:h-64 flex flex-col justify-between shadow-2xl shadow-orange-500/20 relative overflow-hidden group hover:-translate-y-2 transition-transform border border-white/10"
                            >
                                <div className="absolute top-6 right-6 w-3 h-3 bg-white/30 rounded-sm"></div>
                                <h3 className="text-5xl md:text-7xl font-medium tracking-tight mt-auto">150<span className="text-orange-200">+</span></h3>
                                <p className="font-medium text-orange-100 text-sm md:text-base mt-2">Projects delivered</p>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="bg-gradient-to-br from-[#d90429]/90 to-[#9d0208]/90 backdrop-blur-md rounded-[2rem] p-6 md:p-8 text-white h-56 md:h-64 flex flex-col justify-between mt-12 shadow-2xl shadow-red-500/20 relative overflow-hidden group hover:-translate-y-2 transition-transform border border-white/10"
                            >
                                <div className="absolute top-6 right-6 w-3 h-3 bg-white/30 rounded-full"></div>
                                <h3 className="text-5xl md:text-7xl font-medium tracking-tight mt-auto">98<span className="text-red-200">%</span></h3>
                                <p className="font-medium text-red-100 text-sm md:text-base mt-2">Client retention</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="max-w-7xl mx-auto px-6 pb-20 pt-10"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/10 pt-12">
                    <p className="text-sm font-semibold text-white/80 uppercase tracking-widest shrink-0">Our Partners</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-8 md:gap-12 text-white/70">
                        <span className="font-bold flex items-center gap-2 text-xl hover:text-white transition-colors cursor-pointer"><Square size={24} className="text-white/70 fill-white/70"/> BookStore</span>
                        <span className="font-bold flex items-center gap-2 text-xl hover:text-white transition-colors cursor-pointer"><Hexagon size={24} className="text-white/70 fill-white/70"/> Zaurytoc</span>
                        <span className="font-bold flex items-center gap-2 text-xl hover:text-white transition-colors cursor-pointer"><Circle size={24} className="text-white/70 fill-white/70"/> Crond</span>
                        <span className="font-bold flex items-center gap-2 text-xl hover:text-white transition-colors cursor-pointer"><Triangle size={24} className="text-white/70 fill-white/70"/> Mercury</span>
                        <span className="font-bold flex items-center gap-2 text-xl hover:text-white transition-colors cursor-pointer"><Star size={24} className="text-white/70 fill-white/70"/> Wegin</span>
                    </div>
                </div>
            </motion.div>

            {/* Content Sections */}
            {!userData && <section id="how-it-works" className='max-w-7xl mx-auto px-6 pb-32 mt-10'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                    {highlights.map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="rounded-[2rem] bg-black/20 border border-white/10 p-10 hover:shadow-2xl hover:shadow-black/20 hover:bg-black/30 transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-white/10 rounded-2xl shadow-sm border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                <div className="w-6 h-6 bg-red-500 rounded-full opacity-40"></div>
                            </div>
                            <h1 className='text-2xl font-bold text-white mb-4'>{h}</h1>
                            <p className='text-white/70 leading-relaxed text-lg'>
                                LIXA AI builds real websites — clean code,
                                animations, responsiveness and scalable structure.
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>}

            {userData && websites?.length > 0 && (
                <section id="how-it-works" className='max-w-7xl mx-auto px-6 pb-32 mt-10'>
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h3 className='text-4xl font-bold text-white mb-2 tracking-tight'>Your Websites</h3>
                            <p className="text-white/70">Pick up where you left off</p>
                        </div>
                        <button className="text-sm font-semibold text-red-300 hover:text-red-200 flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full transition-colors">
                            View All <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                        {websites.slice(0, 3).map((w, i) => (
                            <motion.div
                                key={w._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8 }}
                                onClick={() => navigate(`/editor/${w._id}`)}
                                className="cursor-pointer rounded-[2rem] bg-black/20 border border-white/10 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 group"
                            >
                                <div className='h-56 bg-zinc-900 relative border-b border-white/10 overflow-hidden'>
                                    <iframe
                                        srcDoc={w.latestCode}
                                        className='w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white transition-transform duration-700 group-hover:scale-[0.75]'
                                        title={w.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className='p-8'>
                                    <h3 className='text-xl font-bold text-white line-clamp-1 mb-2 group-hover:text-red-400 transition-colors'>{w.title}</h3>
                                    <p className='text-sm text-white/60 flex items-center gap-2'>
                                        <span className="relative flex h-2.5 w-2.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                        </span>
                                        Updated {new Date(w.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            <footer className='border-t border-white/10 py-16 text-center text-sm text-white/60 bg-black/20'>
                <div className='flex justify-center items-center gap-2 mb-8'>
                    <img src={lixaLogo} alt="LIXA AI" className='h-10 w-auto' style={{mixBlendMode: 'screen'}} />
                    <span className='text-xl font-bold tracking-wide text-white'>LIXA AI</span>
                </div>
                <div className='flex justify-center gap-8 mb-8'>
                    <a href="/terms" className='hover:text-white font-medium transition-colors'>Terms & Conditions</a>
                    <a href="/privacy-policy" className='hover:text-white font-medium transition-colors'>Privacy Policy</a>
                    <a href="/pricing" className='hover:text-white font-medium transition-colors'>Pricing</a>
                </div>
                <p>&copy; {new Date().getFullYear()} LIXA AI. All rights reserved.</p>
            </footer>

            {openLogin && <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />}
        </div>
    )
}

export default Home
