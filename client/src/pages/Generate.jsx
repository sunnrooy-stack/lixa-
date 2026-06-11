import { ArrowLeft, ArrowRight, Monitor, Smartphone, Palette, PlayCircle, X, Check } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "motion/react"
import { useSelector } from 'react-redux'
import axios from "axios"
import { serverUrl } from '../App'
import lixaLogo from '../assets/lixa-logo.png'

const PHASES = [
    "Analyzing your idea…",
    "Designing layout & structure…",
    "Writing HTML & CSS…",
    "Adding animations & interactions…",
    "Final quality checks…",
];

const CATEGORIES = [
    { id: '3d', name: '3D Website', icon: Monitor, prompt: "Create a stunning 3D website with interactive models..." },
    { id: 'app', name: 'App Build', icon: Smartphone, prompt: "Build a modern mobile app UI with smooth animations..." },
    { id: 'design', name: 'Design', icon: Palette, prompt: "Design a beautiful landing page with glassmorphism..." },
    { id: 'animation', name: 'Animation', icon: PlayCircle, prompt: "Create a web application with dynamic scroll animations..." }
];

function Generate() {
    const { userData } = useSelector(state => state.user) || {}
    const navigate = useNavigate()
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [phaseIndex, setPhaseIndex] = useState(0)
    const [error,setError]=useState("")
    const [placeholderText, setPlaceholderText] = useState("")
    const [selectedCategory, setSelectedCategory] = useState(null)

    useEffect(() => {
        const placeholders = [
            "Build Your Dream Website",
            "Create Stunning Designs",
            "Launch Your Business Online"
        ];
        
        let currentTextIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timeout;

        const type = () => {
            const currentString = placeholders[currentTextIndex];
            
            if (isDeleting) {
                setPlaceholderText(currentString.substring(0, charIndex - 1));
                charIndex--;
            } else {
                setPlaceholderText(currentString.substring(0, charIndex + 1));
                charIndex++;
            }

            let typingSpeed = isDeleting ? 30 : 80;

            if (!isDeleting && charIndex === currentString.length) {
                typingSpeed = 2000; // Pause at end of phrase
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                currentTextIndex = (currentTextIndex + 1) % placeholders.length;
                typingSpeed = 500; // Pause before typing next phrase
            }

            timeout = setTimeout(type, typingSpeed);
        };

        timeout = setTimeout(type, 500);

        return () => clearTimeout(timeout);
    }, []);

    const handleGenerateWebsite = async () => {

        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/website/generate`, { prompt }, { withCredentials: true })
            console.log(result)
            setProgress(100)
            setLoading(false)
            navigate(`/editor/${result.data.websiteId}`)
        } catch (error) {
            setLoading(false)
            const errorMsg = error.response?.data?.message || "something went wrong"
            setError(errorMsg)
            console.log(error)
            
            if (errorMsg.toLowerCase().includes("credits")) {
                setTimeout(() => {
                    navigate("/pricing")
                }, 1500)
            }
        }
    }


    useEffect(() => {
        if (!loading) {
            setPhaseIndex(0)
            setProgress(0)
            return
        }

        let value = 0
        let phase = 0

        const interval = setInterval(() => {
            const increment = value < 20
                ? Math.random() * 1.5
                : value < 60
                    ? Math.random() * 1.2
                    : Math.random() * 0.6;
            value += increment

            if (value >= 93) value = 93;

            phase = Math.min(
                Math.floor((value / 100) * PHASES.length), PHASES.length - 1
            )

            setProgress(Math.floor(value))
            setPhaseIndex(phase)

        }, 1200)

        return () => clearInterval(interval)
    }, [loading])

    return (
        <div className='min-h-screen bg-linear-to-br from-[#050505] via-[#0b0b0b] to-[#050505] text-white'>
            <div className='sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10'>
                <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button className='p-2 rounded-lg hover:bg-white/10 transition' onClick={() => navigate("/")}><ArrowLeft size={16} /></button>
                        <img src={lixaLogo} alt="LIXA AI" className='h-14 w-auto' style={{mixBlendMode: 'screen'}} />
                        <span className='text-2xl font-bold tracking-wide'>LIXA AI</span>
                    </div>

                </div>
            </div>

            <div className='max-w-6xl mx-auto px-6 py-16'>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className='text-3xl md:text-4xl font-semibold mb-3'>
                        Hi {userData?.name || 'there'}, what do you want to create?
                    </h1>
                </motion.div>
                <div className='mb-8 max-w-4xl mx-auto'>
                    <div className='relative'>
                        <textarea
                            onChange={(e) => setPrompt(e.target.value)}
                            value={prompt}
                            placeholder={`${placeholderText}|`}
                            className='w-full min-h-[100px] p-5 pb-16 rounded-3xl bg-black/60 border border-white/20 outline-none resize-none text-base leading-relaxed focus:ring-2 focus:ring-blue-500/50 transition-all'></textarea>
                        
                        {selectedCategory && (() => {
                            const category = CATEGORIES.find(c => c.id === selectedCategory);
                            if (!category) return null;
                            const Icon = category.icon;
                            return (
                                <div className='absolute bottom-4 left-4 flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-sm border border-blue-500/30'>
                                    <Icon size={14} />
                                    <span className='font-medium'>{category.name}</span>
                                    <button onClick={() => {
                                        setSelectedCategory(null);
                                    }} className='hover:text-white transition-colors ml-1'>
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })()}

                        <div className='absolute bottom-4 right-4 flex gap-3'>
                            <button 
                                onClick={handleGenerateWebsite}
                                disabled={!prompt.trim() && loading}
                                className={`p-2 rounded-xl transition-all flex items-center justify-center ${prompt.trim() && !loading ? 'bg-white text-black hover:scale-105' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className='mt-4 text-sm text-red-400 text-center'>{error}</p>}

                    <div className='flex flex-wrap justify-center gap-6 mt-8'>
                        {CATEGORIES.map(category => {
                            const isSelected = selectedCategory === category.id;
                            const Icon = isSelected ? Check : category.icon;
                            
                            return (
                                <button key={category.id} className={`flex flex-col items-center gap-2 transition-colors group ${isSelected ? 'text-white' : 'text-zinc-400 hover:text-white'}`} onClick={() => {
                                    setSelectedCategory(category.id);
                                }}>
                                    <div className={`p-4 rounded-2xl border transition-colors ${isSelected ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className='text-xs font-medium'>{category.name}</span>
                                </button>
                            )
                        })}
                    </div>

                </div>


                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-xl mx-auto mt-12"
                    >
                        <div className='flex justify-between mb-2 text-xs text-zinc-400'>
                            <span >{PHASES[phaseIndex]}</span>
                            <span >{progress}%</span>
                        </div>

                        <div className='h-2 w-full bg-white/10 rounded-full overflow-hidden'>
                            <motion.div
                                className="h-full bg-linear-to-r from-white to-zinc-300"
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "easeOut", duration: 0.8 }}
                            />
                        </div>

                        <div className='text-center text-xs text-zinc-400 mt-4'>
                            Estimated time remaining:{" "}
                            <span className="text-white font-medium">
                                ~8–12 minutes
                            </span>
                        </div>

                    </motion.div>
                )}


            </div>
        </div>
    )
}

export default Generate
