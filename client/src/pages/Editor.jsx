import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { useState } from 'react'
import { ArrowLeft, Check, Code, Code2, MessageCircle, MessageSquare, Monitor, Rocket, Send, Share2, X, Plus, Folder, File, Save, Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { useSelector } from 'react-redux'

import Editor from '@monaco-editor/react';

const compileFilesToHtml = (filesList) => {
    if (!filesList || !Array.isArray(filesList) || filesList.length === 0) {
        return "";
    }
    let htmlFile = filesList.find(f => f.path === "frontend/index.html") || 
                   filesList.find(f => f.path.endsWith("index.html")) || 
                   filesList.find(f => f.path.endsWith(".html"));
                   
    if (!htmlFile) {
        htmlFile = filesList[0];
    }
    
    let htmlContent = htmlFile ? htmlFile.content : "";
    
    const cssFiles = filesList.filter(f => f.path.endsWith(".css"));
    let cssContent = cssFiles.map(f => f.content).join("\n");
    
    const jsFiles = filesList.filter(f => f.path.startsWith("frontend/") && f.path.endsWith(".js"));
    let jsContent = jsFiles.map(f => f.content).join("\n");
    
    if (cssContent) {
        htmlContent = htmlContent.replace(/<link[^>]*href=["'][^"']*style\.css["'][^>]*>/gi, "");
        if (htmlContent.includes("</head>")) {
            htmlContent = htmlContent.replace("</head>", `<style>\n${cssContent}\n</style>\n</head>`);
        } else {
            htmlContent = htmlContent + `\n<style>\n${cssContent}\n</style>`;
        }
    }
    
    if (jsContent) {
        htmlContent = htmlContent.replace(/<script[^>]*src=["'][^"']*script\.js["'][^>]*>[\s\S]*?<\/script>/gi, "");
        if (htmlContent.includes("</body>")) {
            htmlContent = htmlContent.replace("</body>", `<script>\n${jsContent}\n</script>\n</body>`);
        } else {
            htmlContent = htmlContent + `\n<script>\n${jsContent}\n</script>`;
        }
    }
    
    return htmlContent;
}

const getLanguage = (path) => {
    if (!path) return 'html';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.json')) return 'json';
    return 'plaintext';
}

function WebsiteEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { userData } = useSelector(state => state.user) || {}
    const [website, setWebsite] = useState(null)
    const [error, setError] = useState("")
    const [code, setCode] = useState("")
    const [files, setFiles] = useState([])
    const [activeFile, setActiveFile] = useState(null)
    const [messages, setMessages] = useState([])
    const [prompt, setPrompt] = useState("")
    const iframeRef = useRef(null)
    const fileInputRef = useRef(null)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [saveLoading, setSaveLoading] = useState(false)
    const [thinkingIndex, setThinkingIndex] = useState(0)
    const [showCode, setShowCode] = useState(false)
    const [showFullPreview, setShowFullPreview] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [copied, setCopied] = useState(false)
    const [saved, setSaved] = useState(false)
    
    const thinkingSteps = [
        "Understanding your request…",
        "Planning layout changes…",
        "Improving responsiveness…",
        "Applying animations…",
        "Finalizing update…",
    ]

    const handleUpdate = async () => {
        if (!prompt) return

        setUpdateLoading(true)
        const text = prompt
        setPrompt("")
        setMessages((m) => [...m, { role: "user", content: text }])
        try {
            const result = await axios.post(`${serverUrl}/api/website/update/${id}`, { prompt: text }, { withCredentials: true })
            console.log(result)
            setUpdateLoading(false)
            setMessages((m) => [...m, { role: "ai", content: result.data.message }])
            setCode(result.data.code)
            if (result.data.files && result.data.files.length > 0) {
                setFiles(result.data.files)
                // update active file reference with its new content
                if (activeFile) {
                    const freshFile = result.data.files.find(f => f.path === activeFile.path)
                    if (freshFile) {
                        setActiveFile(freshFile)
                    } else {
                        setActiveFile(result.data.files[0])
                    }
                }
            }
        } catch (error) {
            setUpdateLoading(false)
            const errorMsg = error.response?.data?.message || "Something went wrong"
            const statusCode = error.response?.status
            setMessages((m) => [...m, { role: "ai", content: `Error: ${errorMsg}` }])
            console.log(error)
            
            if (statusCode === 400 && errorMsg.toLowerCase().includes("not enough credits")) {
                setTimeout(() => {
                    navigate("/pricing")
                }, 1500)
            }
        }
    }

    const handleSaveManual = async () => {
        if (files.length === 0) return;
        setSaveLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/website/save/${id}`, { files }, { withCredentials: true })
            setCode(result.data.code)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            console.log("save error", err)
        } finally {
            setSaveLoading(false)
        }
    }

    const handleFileContentChange = (newVal) => {
        if (!activeFile) return;
        const updatedFiles = files.map(f => {
            if (f.path === activeFile.path) {
                return { ...f, content: newVal };
            }
            return f;
        });
        setFiles(updatedFiles);
        setActiveFile({ ...activeFile, content: newVal });
        
        // Update live compiled code for the iframe view
        const compiled = compileFilesToHtml(updatedFiles);
        setCode(compiled);
    }

    const handleDeploy = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/website/deploy/${website._id}`, { withCredentials: true })
            window.open(`${result.data.url}`, "_blank")
           
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (!updateLoading) return;
        const i = setInterval(() => {
            setThinkingIndex((i) => (i + 1) % thinkingSteps.length)
        }, 1200)

        return () => clearInterval(i)
    }, [updateLoading])

    useEffect(() => {
        const handleGetWebsite = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/website/get-by-id/${id}`, { withCredentials: true })
                setWebsite(result.data)
                setCode(result.data.latestCode)
                setMessages(result.data.conversation)
                
                const initialFiles = result.data.files && result.data.files.length > 0
                    ? result.data.files
                    : [
                        { path: "frontend/index.html", content: result.data.latestCode || "" },
                        { path: "frontend/style.css", content: "" },
                        { path: "frontend/script.js", content: "" }
                      ];
                setFiles(initialFiles)
                const defaultActive = initialFiles.find(f => f.path === "frontend/index.html") || initialFiles[0]
                setActiveFile(defaultActive)
            } catch (error) {
                console.log(error)
                setError(error.response?.data?.message || "Error fetching website")
            }
        }
        handleGetWebsite()
    }, [id])

    useEffect(() => {
        if (!iframeRef.current || !code) return;
        const blob = new Blob([code], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        iframeRef.current.src = url
        return () => URL.revokeObjectURL(url)
    }, [code])

    if (error) {
        return (
            <div className='h-screen flex items-center justify-center bg-[#0a0000] text-red-400'>
                {error}
            </div>
        )
    }
    if (!website) {
        return (
            <div className='h-screen flex items-center justify-center bg-[#0a0000] text-red-200'>
                Loading...
            </div>
        )
    }



    return (
        <div className='h-screen w-screen flex bg-[#0a0000] text-red-100 overflow-hidden'>
            <aside className='hidden lg:flex w-95 flex-col border-r border-red-500/20 bg-[#0d0000]/90'>
                <Header />
                <>
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"
                                    }`}
                            >

                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-red-600/30 text-red-100 border border-red-500/30"
                                        : "bg-red-950/40 border border-red-500/15 text-red-200/80"
                                        }`}
                                >

                                    {m.content}

                                </div>

                            </div>
                        ))}

                        {updateLoading &&

                            <div className='max-w-[85%] mr-auto'>
                                <div className='px-4 py-2.5 rounded-2xl text-xs bg-red-950/40 border border-red-500/15 text-red-400/70 italic'>{thinkingSteps[thinkingIndex]}</div>
                            </div>}




                    </div>
                    <div className='p-3 border-t border-red-500/20'>
                        <div className='flex gap-2 items-center'>
                            <input type='file' accept='image/*' className='hidden' ref={fileInputRef} />
                            <button onClick={() => fileInputRef.current?.click()} className='p-3 rounded-full bg-red-950/40 border border-red-500/20 hover:bg-red-900/40 text-red-400 transition-colors'>
                                <Plus size={18} />
                            </button>
                            <button className='p-1.5 rounded-md border border-dashed border-red-500/30 text-red-400 hover:text-red-200 transition-colors flex items-center justify-center' title='AI Generator'>
                                <Sparkles size={20} />
                            </button>
                            <input placeholder='Describe Changes...' className='flex-1 resize-none rounded-full px-5 py-3 bg-red-950/30 border border-red-500/20 text-sm outline-none focus:ring-2 focus:ring-red-500/50 text-red-100 placeholder:text-red-400/40 transition-all' onChange={(e) => setPrompt(e.target.value)} value={prompt} />
                            <button className='px-5 py-3 rounded-full bg-red-600 text-white hover:bg-red-500 hover:scale-105 transition-all shadow-lg shadow-red-600/30' disabled={updateLoading} onClick={handleUpdate}><Send size={14} /></button>
                        </div>
                    </div>

                </>
            </aside>

            <div className='flex-1 flex flex-col'>
                <div className='h-14 px-4 flex justify-between items-center border-b border-red-500/20 bg-[#0d0000]/90'>
                    <span className='text-xs text-red-400/60'>Live Preview</span>
                    <div className='flex gap-2'>
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 hover:scale-105 transition shadow-lg shadow-red-600/30'
                        onClick={handleDeploy}
                        ><Rocket size={14} /> Deploy</button>
                        {website.deployUrl && <button className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold hover:scale-105 transition ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-950/40 hover:bg-red-900/40 border border-red-500/20 text-red-300'}`}
                        onClick={() => { navigator.clipboard.writeText(website.deployUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        >{copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Share</>}</button>}
                       
                        <button className='p-2 lg:hidden text-red-400 hover:text-red-200' onClick={() => setShowChat(true)}><MessageSquare size={18} /></button>

                        <button className='p-2 text-red-400 hover:text-red-200' onClick={() => setShowCode(true)}><Code2 size={18} /></button>
                        <button className='p-2 text-red-400 hover:text-red-200' onClick={() => setShowFullPreview(true)}><Monitor size={18} /></button>
                    </div>

                </div>

                <iframe ref={iframeRef} sandbox='allow-scripts allow-same-origin allow-forms' className='flex-1 w-full bg-white' />
            </div>

            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="fixed inset-0 z-[9999] bg-[#0a0000] flex flex-col"
                    >
                   <Header onclose={()=>setShowChat(false)}/>
                   <>
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"
                                    }`}
                            >

                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-white text-black"
                                        : "bg-white/5 border border-white/10 text-zinc-200"
                                        }`}
                                >

                                    {m.content}

                                </div>

                            </div>
                        ))}

                        {updateLoading &&

                            <div className='max-w-[85%] mr-auto'>
                                <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>{thinkingSteps[thinkingIndex]}</div>
                            </div>}




                    </div>
                    <div className='p-3 border-t border-red-500/20'>
                        <div className='flex gap-2 items-center'>
                            <input type='file' accept='image/*' className='hidden' ref={fileInputRef} />
                            <button onClick={() => fileInputRef.current?.click()} className='p-3 rounded-full bg-red-950/40 border border-red-500/20 hover:bg-red-900/40 text-red-400 transition-colors'>
                                <Plus size={18} />
                            </button>
                            <button className='p-1.5 rounded-md border border-dashed border-red-500/30 text-red-400 hover:text-red-200 transition-colors flex items-center justify-center' title='AI Generator'>
                                <Sparkles size={20} />
                            </button>
                            <input placeholder='Describe Changes...' className='flex-1 resize-none rounded-full px-5 py-3 bg-red-950/30 border border-red-500/20 text-sm outline-none focus:ring-2 focus:ring-red-500/50 text-red-100 placeholder:text-red-400/40 transition-all' onChange={(e) => setPrompt(e.target.value)} value={prompt} />
                            <button className='px-5 py-3 rounded-full bg-red-600 text-white hover:bg-red-500 hover:scale-105 transition-all shadow-lg shadow-red-600/30' disabled={updateLoading} onClick={handleUpdate}><Send size={14} /></button>
                        </div>
                    </div>

                </>
                    </motion.div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {showCode && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        className="fixed inset-y-0 right-0 w-full lg:w-[60%] z-[9999] bg-[#0d0000] flex flex-col shadow-2xl shadow-red-900/30 border-l border-red-500/20"
                    >
                        {/* Header bar */}
                        <div className='h-12 px-4 flex justify-between items-center border-b border-red-500/20 bg-[#0a0000]'>
                            <div className='flex items-center gap-2'>
                                <Code size={16} className="text-red-400" />
                                <span className='text-sm font-medium text-red-300'>Project Editor</span>
                            </div>
                            <div className='flex items-center gap-3'>
                                <button 
                                    onClick={handleSaveManual}
                                    disabled={saveLoading}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
                                        saved 
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                            : 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-50'
                                    }`}
                                >
                                    <Save size={13} />
                                    {saveLoading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                                </button>
                                <button onClick={() => setShowCode(false)} className="text-red-400 hover:text-red-200 transition">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Split panel for File Explorer and Monaco Editor */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* File Explorer (Left side of the Code Drawer) */}
                            <div className="w-56 border-r border-red-500/10 bg-[#080000] p-3 flex flex-col overflow-y-auto">
                                <div className="text-xxs font-bold tracking-wider text-red-500/50 uppercase mb-3">Workspace Files</div>
                                {(() => {
                                    // Group files by top-level folder
                                    const folders = {};
                                    const rootFiles = [];
                                    
                                    files.forEach(file => {
                                        const parts = file.path.split('/');
                                        if (parts.length > 1) {
                                            const folderName = parts[0];
                                            if (!folders[folderName]) folders[folderName] = [];
                                            folders[folderName].push(file);
                                        } else {
                                            rootFiles.push(file);
                                        }
                                    });
                                    
                                    return (
                                        <div className="space-y-3 font-mono text-xs select-none">
                                            {Object.keys(folders).map(folder => (
                                                <div key={folder} className="space-y-1">
                                                    <div className="flex items-center gap-1.5 px-1 py-0.5 text-red-300/70 font-semibold">
                                                        <Folder size={13} className="text-red-500/80" />
                                                        <span>{folder}</span>
                                                    </div>
                                                    <div className="pl-3 border-l border-red-500/10 ml-2 space-y-0.5">
                                                        {folders[folder].map(file => {
                                                            const isActive = activeFile && activeFile.path === file.path;
                                                            const fileName = file.path.split('/').slice(1).join('/');
                                                            return (
                                                                <div 
                                                                    key={file.path} 
                                                                    onClick={() => setActiveFile(file)}
                                                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                                                                        isActive 
                                                                            ? 'bg-red-500/15 text-red-200 font-medium border border-red-500/20' 
                                                                            : 'text-red-400/40 hover:bg-red-500/10 hover:text-red-300'
                                                                    }`}
                                                                >
                                                                    <File size={11} className={isActive ? 'text-red-300' : 'text-red-500/30'} />
                                                                    <span className="truncate">{fileName}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                            {rootFiles.length > 0 && (
                                                <div className="pt-2 border-t border-red-500/10 space-y-0.5">
                                                    {rootFiles.map(file => {
                                                        const isActive = activeFile && activeFile.path === file.path;
                                                        return (
                                                            <div 
                                                                key={file.path} 
                                                                onClick={() => setActiveFile(file)}
                                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                                                                    isActive 
                                                                        ? 'bg-red-500/15 text-red-200 font-medium border border-red-500/20' 
                                                                        : 'text-red-400/40 hover:bg-red-500/10 hover:text-red-300'
                                                                }`}
                                                            >
                                                                <File size={11} className={isActive ? 'text-red-300' : 'text-red-500/30'} />
                                                                <span className="truncate">{file.path}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Monaco Editor Pane (Right side of the Code Drawer) */}
                            <div className="flex-1 flex flex-col bg-[#0d0000]">
                                {activeFile && (
                                    <div className="h-8 px-4 flex items-center bg-[#0a0000] border-b border-red-500/10">
                                        <span className="text-xxs font-mono text-red-400/60">{activeFile.path}</span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    {activeFile ? (
                                        <Editor
                                            theme='vs-dark'
                                            value={activeFile.content}
                                            language={getLanguage(activeFile.path)}
                                            onChange={handleFileContentChange}
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-red-400/40 text-sm">
                                            Select a file to edit
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFullPreview && (
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-[#0a0000]"
                    >
                        <iframe className='w-full h-full bg-white' srcDoc={code} sandbox='allow-scripts allow-same-origin allow-forms'/>
                        <button onClick={() => setShowFullPreview(false)} className='absolute top-4 right-4 p-2 bg-black/70 rounded-lg'><X /></button>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    )

    function Header({onclose}) {
        return (
            <div className='h-14 px-4 flex items-center justify-between border-b border-red-500/20'>
                <span className='font-semibold truncate text-red-100'>{website.title}</span>
                {onclose &&  <button onClick={onclose}><X size={18} color='white'/></button>}
           
            </div>
        )
    }



}





export default WebsiteEditor
