const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function listModels() {
    process.loadEnvFile('.env.local');
    const apiKey = process.env.GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
        // Wait, listModels is on the genAI instance or similar? 
        // Actually it's often more complex in the SDK.
        // Let's use a simpler way if possible or just check documentation.
        // In the SDK: genAI.listModels() ? No.
    } catch (e) {
        console.error("Error listing models:", e.message);
    }
}
// Actually LangChain might have a way or I can just guess better.
// "gemini-1.5-flash" is usually the correct name.
// "gemini-pro" is for 1.0.
