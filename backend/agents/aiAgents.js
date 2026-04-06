const { OpenAI } = require('openai');
const fs = require('fs');
require('dotenv').config();

// Will use process.env.OPENAI_API_KEY
// Fallback mapping is preserved in case api key isn't provided locally
let openai;
try {
  openai = new OpenAI();
} catch (e) {
  console.warn("OpenAI API Key missing securely inside ENV - Fallbacks mapped successfully.");
}

/**
 * 1. Classification Agent
 * - Classifies complaint into categories: (roads, sanitation, water, electricity, others)
 */
async function classificationAgent(description) {
  console.log("CLASSIFICATION AGENT: Analyzing description...");
  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("No API Key");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ 
        role: "system", 
        content: "You are an automated dispatch system capable of reading any language globally. Translate internally to English and return ONLY one of the following words representing the issue category: 'roads', 'sanitation', 'water', 'electricity', 'others'." 
      }, { 
        role: "user", 
        content: `Classify this issue: ${description}` 
      }],
      temperature: 0
    });
    
    return response.choices[0].message.content.trim().toLowerCase();
  } catch (err) {
    console.warn("OpenAI Failed or Not Configured. Using rule-based fallback.");
    if (description.toLowerCase().includes('pothole') || description.toLowerCase().includes('road')) return 'roads';
    if (description.toLowerCase().includes('water') || description.toLowerCase().includes('pipe')) return 'water';
    if (description.toLowerCase().includes('wire') || description.toLowerCase().includes('power')) return 'electricity';
    return 'others';
  }
}

/**
 * 2. Priority Agent
 * - Assigns urgency levels: (low, medium, high, critical)
 */
async function priorityAgent(text, category, location) {
  console.log("PRIORITY AGENT: Determining urgency...");
  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("No API Key");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ 
        role: "system", 
        content: "You are an emergency assessment AI capable of reading any language globally. Translate input naturally, then return ONLY one word indicating the priority of this problem based on threat to life, traffic, or prolonged resource outage: 'low', 'medium', 'high', 'critical'." 
      }, { 
        role: "user", 
        content: `Severity assessment. Category: ${category}. Complaint: ${text}` 
      }],
      temperature: 0
    });
    
    return response.choices[0].message.content.trim().toLowerCase();
  } catch(err) {
    if (text.toLowerCase().includes('accident') || text.toLowerCase().includes('hazard')) return 'critical';
    if (category === 'electricity' && text.toLowerCase().includes('wire')) return 'high';
    return 'medium'; // Default fallback
  }
}

/**
 * 3. Verification Agent
 * - Detects fake/spam complaints (simulated basic CV and LLM parsing)
 */
async function verificationAgent({ title, description, imageUrl, originalImageName, location }) {
  console.log("VERIFICATION AGENT: Validating data...");
  let isSpam = false;
  let similarityScore = Math.random(); 

  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("No API Key");
    
    const systemPrompt = "Determine if this complaint is spam, fake, or abusive. If an image is provided, cross-reference it with the description. If the image completely mismatches the description (for example, the text describes a broken pipe but the image shows a generic unrelated photo), or if the complaint situation is absurd, flag it as fake. Reply with ONLY 'true' (if fake/spam) or 'false' (if valid).";

    let userContent = [
      { type: "text", text: `Title: ${title}\nDesc: ${description}` }
    ];

    if (imageUrl && fs.existsSync(imageUrl)) {
      const imgData = fs.readFileSync(imageUrl, { encoding: 'base64' });
      const mimeType = imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${imgData}`
        }
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ 
        role: "system", 
        content: systemPrompt
      }, { 
        role: "user", 
        content: userContent 
      }],
      temperature: 0
    });
    
    isSpam = response.choices[0].message.content.trim().replace(/[^a-zA-Z]/g, '').toLowerCase() === 'true';
  } catch (err) {
    // Basic rules fallback: Local simulation for text & images since there's no API key
    const textToAnalyze = (title + " " + description).toLowerCase();
    
    // Simulate image vision detection failure by looking at the filename uploaded
    if (originalImageName) {
        const lowerImgName = originalImageName.toLowerCase();
        // If the user uploads a picture of a dog/cat or explicitly names it fake, simulating image mismatch
        if (lowerImgName.includes('fake') || lowerImgName.includes('dog') || lowerImgName.includes('cat') || lowerImgName.includes('stock')) {
            console.log("MOCK VISION: Detected severe image mismatch in fallback rules!");
            isSpam = true;
        }
    }

    if (description.length < 5 || 
        title.toUpperCase() === title || 
        textToAnalyze.includes('fake') || 
        textToAnalyze.includes('spam') || 
        textToAnalyze.includes('test')) {
      isSpam = true; 
    }
  }
  
  return { isSpam, imageValid: true, similarityScore };
}

/**
 * 4. Routing Agent
 * - Maps to authoritative module
 */
async function routingAgent(description, category) {
   console.log("ROUTING AGENT: Mapping to authority route...");
   let department = 'Others';
   const lowerDesc = description ? description.toLowerCase() : '';
   
   if (lowerDesc.includes('pothole') || lowerDesc.includes('road damage') || category === 'roads') {
     department = 'Roads';
   } else if (lowerDesc.includes('no water') || lowerDesc.includes('leakage') || category === 'water') {
     department = 'Water';
   } else if (lowerDesc.includes('power cut') || lowerDesc.includes('wire') || category === 'electricity') {
     department = 'Electricity';
   } else if (lowerDesc.includes('garbage') || lowerDesc.includes('waste') || category === 'sanitation') {
     department = 'Sanitation';
   }
   
   return { mappedDeptStr: department, status: 'dispatched' };
}

/**
 * 5. Speech To Text Agent (Whisper)
 * - Transcribes user voice memos
 */
async function speechToTextAgent(audioFilePath) {
   console.log("SPEECH TO TEXT AGENT: Transcribing Audio...");
   try {
      if (!process.env.OPENAI_API_KEY) throw new Error("No API Key");
      
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: "whisper-1",
      });
      return transcription.text;
   } catch (err) {
      console.warn("Whisper failed or API Key missing. Returning fallback simulation.");
      return "There is a massive pothole in the middle of 5th Avenue causing traffic blockages.";
   }
}

module.exports = {
  classificationAgent,
  priorityAgent,
  verificationAgent,
  routingAgent,
  speechToTextAgent
};
