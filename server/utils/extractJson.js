const extractJson = async (text) => {
    if (!text) {
        return null
    }
    const cleaned = text.
         replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

        const firstBrace=cleaned.indexOf('{')
        const closeBrace=cleaned.lastIndexOf('}')
        if(firstBrace===-1 || closeBrace==-1)return null
        const jsonString=cleaned.slice(firstBrace,closeBrace+1)
        
        try {
            return JSON.parse(jsonString)
        } catch (e) {
            console.log("JSON parse failed, attempting to fix truncated response...")
            
            // Try to fix truncated JSON: find the last complete "code" value
            try {
                // Extract message field
                const messageMatch = jsonString.match(/"message"\s*:\s*"([^"]*)"/)
                const message = messageMatch ? messageMatch[1] : "Website generated"
                
                // Extract code field - find everything after "code": "
                const codeStart = jsonString.indexOf('"code"')
                if (codeStart === -1) return null
                
                const valueStart = jsonString.indexOf('"', codeStart + 6) + 1
                if (valueStart === 0) return null
                
                // Get the code content, it may be truncated
                let codeContent = jsonString.slice(valueStart)
                
                // Remove trailing incomplete parts
                if (codeContent.endsWith('"')) {
                    codeContent = codeContent.slice(0, -1)
                } else if (codeContent.endsWith('"}')) {
                    codeContent = codeContent.slice(0, -2)
                } else {
                    // Truncated - close any open HTML tags
                    // Remove last incomplete tag if any
                    const lastOpenTag = codeContent.lastIndexOf('<')
                    const lastCloseTag = codeContent.lastIndexOf('>')
                    if (lastOpenTag > lastCloseTag) {
                        codeContent = codeContent.slice(0, lastOpenTag)
                    }
                    // Ensure HTML is properly closed
                    if (!codeContent.includes('</body>')) {
                        codeContent += '</body>'
                    }
                    if (!codeContent.includes('</html>')) {
                        codeContent += '</html>'
                    }
                }
                
                // Unescape JSON string escapes
                codeContent = codeContent.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\t/g, '\t')
                
                return { message, code: codeContent }
            } catch (fixErr) {
                console.log("Could not fix truncated JSON:", fixErr.message)
                return null
            }
        }

}
export default extractJson