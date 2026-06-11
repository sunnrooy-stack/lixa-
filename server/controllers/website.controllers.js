import { generateResponse } from "../config/openRouter.js";
import User from "../models/user.model.js";
import Website from "../models/website.model.js";
import extractJson from "../utils/extractJson.js";

const masterPrompt = `
YOU ARE A PRINCIPAL FULL-STACK ARCHITECT
AND A SENIOR UI/UX ENGINEER.

YOU BUILD HIGH-END, PRODUCTION-GRADE FULL-STACK WEBSITES AND BACKEND SERVERS
SEPARATED INTO FRONTEND AND BACKEND COMPONENTS.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code
- Fully responsive layout for Mobile (<768px), Tablet (768px-1024px), Desktop (>1024px)
- Use high-quality images ONLY from https://images.unsplash.com/ with parameter ?auto=format&fit=crop&w=1200&q=80

--------------------------------------------------
PROJECT DIRECTORY STRUCTURE & REQUIREMENTS
--------------------------------------------------
You must generate a full-stack project structure with a clean separation between the frontend and the backend. Generate the following files:

1. "frontend/index.html"
   - HTML structural page.
   - Must link to style.css using <link rel="stylesheet" href="style.css">.
   - Must link to script.js using <script src="script.js"></script>.
   - Must contain beautiful, professional SPA sections (Home, About, Services/Features, Contact) with a responsive navbar.

2. "frontend/style.css"
   - Premium vanilla CSS rules (responsive layout, grid/flexbox, animations, styling variables, dark mode styling).

3. "frontend/script.js"
   - Pure client-side JS handling navbar toggle, SPA navigation (page switching), form validation, and dynamic interactions.

4. "backend/server.js"
   - Node.js Express server API initialization with CORS, dotenv configuration, and sample database connection setup.

5. "backend/routes/auth.js" (or other backend files if needed)
   - Route file showcasing Firebase authentication logic wrapper or projects store API endpoints using MongoDB (mongoose schema skeleton).

6. "package.json"
   - Dependencies list including: "express", "cors", "mongoose", "firebase-admin", "dotenv" and start scripts.

--------------------------------------------------
OUTPUT FORMAT (RAW JSON ONLY)
--------------------------------------------------
{
  "message": "Short professional confirmation/summary sentence of the project generated",
  "files": [
    {
      "path": "frontend/index.html",
      "content": "..."
    },
    {
      "path": "frontend/style.css",
      "content": "..."
    },
    {
      "path": "frontend/script.js",
      "content": "..."
    },
    {
      "path": "backend/server.js",
      "content": "..."
    },
    {
      "path": "package.json",
      "content": "..."
    }
  ]
}

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- RETURN RAW JSON ONLY
- NO markdown block quotes or explanations outside the JSON format.
- NO extra text
- FORMAT MUST MATCH EXACTLY
`;

const compileFilesToHtml = (files) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
        return "";
    }
    
    // Find the main HTML file
    let htmlFile = files.find(f => f.path === "frontend/index.html") || 
                   files.find(f => f.path.endsWith("index.html")) || 
                   files.find(f => f.path.endsWith(".html"));
                   
    if (!htmlFile) {
        htmlFile = files[0];
    }
    
    let htmlContent = htmlFile ? htmlFile.content : "";
    
    // Find CSS files and inject
    const cssFiles = files.filter(f => f.path.endsWith(".css"));
    let cssContent = cssFiles.map(f => f.content).join("\n");
    
    // Find JS files in frontend
    const jsFiles = files.filter(f => f.path.startsWith("frontend/") && f.path.endsWith(".js"));
    let jsContent = jsFiles.map(f => f.content).join("\n");
    
    // Inject stylesheet link removal and inlining
    if (cssContent) {
        // Strip out the stylesheet link if it exists
        htmlContent = htmlContent.replace(/<link[^>]*href=["'][^"']*style\.css["'][^>]*>/gi, "");
        if (htmlContent.includes("</head>")) {
            htmlContent = htmlContent.replace("</head>", `<style>\n${cssContent}\n</style>\n</head>`);
        } else {
            htmlContent = htmlContent + `\n<style>\n${cssContent}\n</style>`;
        }
    }
    
    // Inject script link removal and inlining
    if (jsContent) {
        // Strip out the script link if it exists
        htmlContent = htmlContent.replace(/<script[^>]*src=["'][^"']*script\.js["'][^>]*>[\s\S]*?<\/script>/gi, "");
        if (htmlContent.includes("</body>")) {
            htmlContent = htmlContent.replace("</body>", `<script>\n${jsContent}\n</script>\n</body>`);
        } else {
            htmlContent = htmlContent + `\n<script>\n${jsContent}\n</script>`;
        }
    }
    
    return htmlContent;
}

export const generateWebsite = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 50) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        const finalPrompt = masterPrompt.replace("USER_PROMPT", prompt)
        let raw = ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed; i++) {
            raw = await generateResponse(finalPrompt)
            parsed = await extractJson(raw)

            if (!parsed) {
                raw = await generateResponse(finalPrompt + "\n\nRETURN ONLY RAW JSON.")
                parsed = await extractJson(raw)
            }

        }

        if (!parsed || !parsed.files || !Array.isArray(parsed.files)) {
            console.log("ai returned invalid response", raw)
            return res.status(500).json({ message: "AI returned invalid response, please try again" })
        }

        const compiledCode = compileFilesToHtml(parsed.files);

        const website = await Website.create({
            user: user._id,
            title: prompt.slice(0, 60),
            latestCode: compiledCode,
            files: parsed.files,
            conversation: [
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "ai",
                    content: parsed.message
                }
            ]
        })

        user.credits = user.credits - 50
        await user.save()

        return res.status(201).json({
            websiteId: website._id,
            remainingCredits: user.credits
        })

    } catch (error) {
        return res.status(500).json({ message: `generate website error ${error}` })
    }
}


export const getWebsiteById = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
        return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get website by id error ${error}` })
    }
}


export const changes = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 25) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        // Prepare existing files array representation for the prompt
        const currentFilesList = website.files && website.files.length > 0
            ? website.files
            : [
                { path: "frontend/index.html", content: website.latestCode || "" },
                { path: "frontend/style.css", content: "" },
                { path: "frontend/script.js", content: "" }
              ];

        const updatePrompt = `
UPDATE THIS FULL-STACK PROJECT FILES.

CURRENT FILES:
${JSON.stringify(currentFilesList, null, 2)}

USER REQUEST FOR CHANGES:
${prompt}

You must update the files, add new files, or edit content. Keep the directory structure:
- frontend/ (index.html, style.css, script.js)
- backend/ (server.js, package.json, routes, etc.)

RETURN RAW JSON ONLY WITH ALL FILES (both modified and unmodified) included:
{
  "message": "Short confirmation of modifications done",
  "files": [
    {
      "path": "frontend/index.html",
      "content": "..."
    },
    ...
  ]
}
`
        let raw = ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed; i++) {
            raw = await generateResponse(updatePrompt)
            parsed = await extractJson(raw)

            if (!parsed) {
                raw = await generateResponse(updatePrompt + "\n\nRETURN ONLY RAW JSON.")
                parsed = await extractJson(raw)
            }

        }

        if (!parsed || !parsed.files || !Array.isArray(parsed.files)) {
            console.log("ai returned invalid response", raw)
            return res.status(500).json({ message: "AI returned invalid response, please try again" })
        }

        const compiledCode = compileFilesToHtml(parsed.files);

        website.conversation.push(
            { role: "user", content: prompt },
            { role: "ai", content: parsed.message },
        )

        website.latestCode = compiledCode
        website.files = parsed.files

        await website.save()
        user.credits = user.credits - 25
        await user.save()

        return res.status(200).json({
            message: parsed.message,
            code: compiledCode,
            files: parsed.files,
            remainingCredits: user.credits
        })


    } catch (error) {
        console.log(error)
 return res.status(500).json({ message: `update website error ${error}` })
    }
}



export const getAll=async (req,res) => {
    try {
        const websites=await Website.find({user:req.user._id})
        return res.status(200).json(websites)
    } catch (error) {
        return res.status(500).json({ message: `get all websites error ${error}` })
    }
}


export const deploy=async (req,res)=>{
    try {
         const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        if(!website.slug){
            website.slug=website.title.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,60)+website._id.toString().slice(-5)              
        }

        website.deployed=true
        const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";
        website.deployUrl=`${frontendUrl}/site/${website.slug}`
        await website.save()

        return res.status(200).json({
            url:website.deployUrl
        })

    } catch (error) {
         return res.status(500).json({ message: `deploy website error ${error}` })
    }
}


export const getBySlug=async (req,res) => {
    try {
         const website = await Website.findOne({
            slug: req.params.slug
         })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
          return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get by slug website error ${error}` })
    }
}

export const saveWebsiteCode = async (req, res) => {
    try {
        const { files } = req.body
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        const compiledCode = compileFilesToHtml(files);
        website.files = files;
        website.latestCode = compiledCode;
        await website.save();

        return res.status(200).json({ message: "Website saved successfully", code: compiledCode })
    } catch (error) {
        return res.status(500).json({ message: `save website error ${error}` })
    }
}