const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const fs = require('fs');

async function testModels() {
    process.loadEnvFile('.env.local');
    const apiKey = process.env.GOOGLE_API_KEY;
    const models = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

    for (const modelName of models) {
        console.log(`\n--- Testing Model: ${modelName} ---`);
        try {
            const model = new ChatGoogleGenerativeAI({
                apiKey: apiKey,
                model: modelName,
            });
            const res = await model.invoke("say hi");
            console.log(`SUCCESS: ${modelName} responded:`, res.content);
            return; // Stop if one works
        } catch (e) {
            console.error(`FAILED: ${modelName} error:`, e.message);
        }
    }
}

testModels();
