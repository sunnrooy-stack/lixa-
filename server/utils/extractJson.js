const extractJson = async (text) => {
    if (!text) {
        return null
    }
    const cleaned = text.
         replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    const firstBrace = cleaned.indexOf('{')
    const closeBrace = cleaned.lastIndexOf('}')
    if (firstBrace === -1) return null
    const jsonString = closeBrace === -1 ? cleaned.slice(firstBrace) : cleaned.slice(firstBrace, closeBrace + 1)
    
    try {
        return JSON.parse(jsonString)
    } catch (e) {
        console.log("JSON parse failed, attempting to fix truncated response for multi-file array...")
        
        try {
            // Extract message field
            const messageMatch = jsonString.match(/"message"\s*:\s*"([^"]*)"/)
            const message = messageMatch ? messageMatch[1] : "Website generated"
            
            const files = []
            const filesIndex = jsonString.indexOf('"files"')
            
            if (filesIndex !== -1) {
                let searchIndex = filesIndex
                while (true) {
                    const pathKeyIndex = jsonString.indexOf('"path"', searchIndex)
                    if (pathKeyIndex === -1) break
                    
                    const pathValStart = jsonString.indexOf('"', pathKeyIndex + 6)
                    if (pathValStart === -1) break
                    const pathValEnd = jsonString.indexOf('"', pathValStart + 1)
                    if (pathValEnd === -1) break
                    const path = jsonString.slice(pathValStart + 1, pathValEnd)
                    
                    const contentKeyIndex = jsonString.indexOf('"content"', pathValEnd)
                    if (contentKeyIndex === -1) {
                        searchIndex = pathValEnd
                        continue
                    }
                    
                    const contentValStart = jsonString.indexOf('"', contentKeyIndex + 9)
                    if (contentValStart === -1) {
                        files.push({ path, content: "" })
                        break
                    }
                    
                    let contentValEnd = -1
                    let isEscaped = false
                    for (let i = contentValStart + 1; i < jsonString.length; i++) {
                        const char = jsonString[i]
                        if (isEscaped) {
                            isEscaped = false
                        } else if (char === '\\') {
                            isEscaped = true
                        } else if (char === '"') {
                            contentValEnd = i
                            break
                        }
                    }
                    
                    let content = ""
                    if (contentValEnd === -1) {
                        content = jsonString.slice(contentValStart + 1)
                        // Clean up trailing json chars if any
                        content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\t/g, '\t')
                        files.push({ path, content })
                        break
                    } else {
                        content = jsonString.slice(contentValStart + 1, contentValEnd)
                        content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\t/g, '\t')
                        files.push({ path, content })
                        searchIndex = contentValEnd + 1
                    }
                }
            }
            
            if (files.length > 0) {
                return { message, files }
            }
            return null
        } catch (fixErr) {
            console.log("Could not fix truncated JSON:", fixErr.message)
            return null
        }
    }
}
export default extractJson