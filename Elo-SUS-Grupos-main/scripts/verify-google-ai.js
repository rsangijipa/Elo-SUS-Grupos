
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser since we can't assume dotenv is installed, and node --env-file is recent
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (!fs.existsSync(envPath)) return {};
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

async function verifyGoogleAI() {
    console.log("🔍 Iniating Google AI Verification...");

    const env = loadEnv();
    const apiKey = env.VITE_GOOGLE_GEN_AI_KEY;

    if (!apiKey) {
        console.error("❌ ERROR: VITE_GOOGLE_GEN_AI_KEY not found in .env file.");
        process.exit(1);
    }

    if (apiKey === 'sua_chave_aqui' || apiKey.includes('YOUR_KEY')) {
        console.error("❌ ERROR: VITE_GOOGLE_GEN_AI_KEY appears to be a placeholder. Please update it with a valid key.");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("⚡ Connecting to Gemini 1.5 Flash...");
        const result = await model.generateContent("Say 'Hello from EloSUS' if you can hear me.");
        const response = await result.response;
        const text = response.text();

        console.log("✅ SUCCESS: Connection Established!");
        console.log("🤖 AI Response:", text);
    } catch (error) {
        console.error("❌ CONNECTION FAILED:");
        if (error.message.includes('API key not valid')) {
            console.error("   Reason: Invalid API Key.");
        } else {
            console.error("   Reason:", error.message);
        }
        process.exit(1);
    }
}

verifyGoogleAI();
