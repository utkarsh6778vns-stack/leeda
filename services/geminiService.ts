import { GoogleGenAI } from "@google/genai";
import { Lead, LeadResponse, GroundingSource } from "../types";

export const generateLeads = async (category: string, city: string, excludedNames: string[] = []): Promise<LeadResponse> => {
  // Initialize inside the function to ensure process.env.API_KEY is available at runtime
  const apiKey = process.env.API_KEY || "";
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let exclusionInstruction = "";
  if (excludedNames.length > 0) {
    exclusionInstruction = `
    IMPORTANT: The user has already seen these businesses: ${JSON.stringify(excludedNames)}.
    You MUST find DIFFERENT businesses. Do not include any of the names listed above.
    `;
  }

  const prompt = `
    Find 8-10 ACTIVE business leads for the category "${category}" in "${city}".
    ${exclusionInstruction}
    
    Use Google Search to find real, operating businesses.
    Prioritize businesses where you can find a public email address or a specific contact page.

    For each business, extract:
    1. Business Name
    2. Website URL (Use "N/A" if not found)
    3. Phone Number (Use "N/A" if not found)
    4. Public Email Address (This is high priority. Look for 'contact', 'about', or footer sections. Use "N/A" if absolutely not found)
    5. Short Address (Street/City)
    6. Description (1 sentence about their specialty)

    CRITICAL OUTPUT FORMAT:
    - You must return ONLY a JSON array representing the leads.
    - Encapsulate the JSON in a Markdown code block: \`\`\`json [ ... ] \`\`\`
    - Object keys must be exactly: "name", "website", "phone", "email", "address", "description".
    - Do not include any text outside the JSON block.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Extract Sources from Grounding Metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .map((chunk) => {
        if (chunk.web) {
          return { title: chunk.web.title || "Web Source", url: chunk.web.uri || "#" };
        }
        return null;
      })
      .filter((s): s is GroundingSource => s !== null);

    // Parse JSON from Markdown Code Block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```JSON\n([\s\S]*?)\n```/) ||
                      text.match(/```\n([\s\S]*?)\n```/);
                      
    let leads: Lead[] = [];

    if (jsonMatch && jsonMatch[1]) {
      try {
        leads = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from code block", e);
        // Fallback: try to parse the raw text if it looks like JSON
        try {
            leads = JSON.parse(text);
        } catch(e2) {
             console.error("Failed to parse raw text as JSON", e2);
        }
      }
    } else {
        // Attempt to parse raw text if no code blocks found
        try {
            const possibleJson = text.trim();
            const startIndex = possibleJson.indexOf('[');
            const endIndex = possibleJson.lastIndexOf(']');
            if (startIndex !== -1 && endIndex !== -1) {
                const jsonStr = possibleJson.substring(startIndex, endIndex + 1);
                leads = JSON.parse(jsonStr);
            }
        } catch (e) {
            console.error("Failed to parse fallback JSON", e);
        }
    }

    // Validation: Ensure required fields exist
    leads = leads.map(lead => ({
        name: lead.name || "Unknown Business",
        website: lead.website || "N/A",
        phone: lead.phone || "N/A",
        email: lead.email || "N/A",
        address: lead.address || city,
        description: lead.description || `A business specializing in ${category}.`
    }));

    return { leads, sources };

  } catch (error) {
    console.error("Error generating leads:", error);
    throw error;
  }
};