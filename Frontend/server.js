import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let genAIClient = null;
let lastUsedApiKey = null;

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return null;
    }
    if (!genAIClient || lastUsedApiKey !== apiKey) {
        lastUsedApiKey = apiKey;
        genAIClient = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build',
                },
            },
        });
    }
    return genAIClient;
}
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
// Gemini Multi-turn Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, userRole, contextData, model } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }
        const ai = getGeminiClient();
        // Context-rich system instruction tailored for EventSphere Expo Platform
        const systemInstruction = `You are the EventSphere AI Intelligence Concierge & Event Operations Strategist.
EventSphere is an enterprise-grade Expo & Convention Management Platform.
The current user interacting with you is in the role: "${userRole || 'attendee'}".

Your core capabilities and knowledge include:
1. EXPOS & CONVENTIONS: Multi-hall floor management, global summit schedules, keynote speaker line-ups, and session bookmarks.
2. BOOTH RESERVATIONS: Standard (10x10, 10x20), Corner (15x15), Island (20x20, 30x30), electricity hookups, freight loading, and fee schedules.
3. EXHIBITOR ONBOARDING: Vendor application approval pipelines, digital product catalogs, live lead retrieval, and direct attendee messaging.
4. ATTENDEE ENGAGEMENT: Instant digital QR turnstile passes, keynote bookmarks, interactive SVG floor plan wayfinding, and concierge inquiries.
5. REAL-TIME DATA CONTEXT:
${contextData ? JSON.stringify(contextData, null, 2) : 'No live data context provided.'}

Guidelines:
- Provide helpful, crisp, professional, and actionable advice.
- If asked to recommend keynotes or booths, reference specific details from the context or provide realistic high-tech industry recommendations.
- Use markdown formatting with bullet points and bold highlights for readability.
- Maintain a welcoming, proactive, enterprise-grade concierge tone.`;
        // Intelligent Fallback if API key is not yet set in environment
        if (!ai) {
            const lastUserMsg = messages[messages.length - 1]?.content || 'Hello';
            const lowerMsg = lastUserMsg.toLowerCase();
            let dynamicAnswer = "";

            if (lowerMsg.includes("qr") || lowerMsg.includes("pass") || lowerMsg.includes("turnstile") || lowerMsg.includes("ticket")) {
                dynamicAnswer = `To access and use your **Digital QR Pass**:\n\n• **Instant Turnstile Access**: Head to the **Attendee Dashboard** and click **"View Digital Pass"** under your registered expos.\n• **Offline Ready**: Your unique QR pass includes encrypted attendee metadata for contactless venue turnstiles.\n• **Wallet Sync**: You can also save or download the digital pass receipt directly to your mobile device for fast onsite entry.`;
            } else if (lowerMsg.includes("occupancy") || lowerMsg.includes("booth") || lowerMsg.includes("revenue") || lowerMsg.includes("hall")) {
                const totalBooths = contextData?.boothsSummary?.total || 24;
                const bookedBooths = contextData?.boothsSummary?.booked || 16;
                const availableBooths = contextData?.boothsSummary?.available || 8;
                const occupancyRate = Math.round((bookedBooths / (totalBooths || 1)) * 100);
                dynamicAnswer = `Here is your current **Floor Plan & Booth Metrics**:\n\n• **Total Hall Capacity**: ${totalBooths} booths across Hall A (Main), Hall B (Tech), and Hall C (Startups)\n• **Booked / Reserved**: ${bookedBooths} booths (${occupancyRate}% occupancy rate)\n• **Available for Selection**: ${availableBooths} prime booths\n• **High-Traffic Zones**: Hall A Central Isle and Hall B Robotics Arena are experiencing maximum foot-traffic velocity.`;
            } else if (lowerMsg.includes("keynote") || lowerMsg.includes("session") || lowerMsg.includes("agenda") || lowerMsg.includes("schedule")) {
                dynamicAnswer = `Here are the **Top Recommended Keynotes & Highlights**:\n\n• **Keynote**: *"Next-Gen AI & Autonomous Systems"* by Dr. Elena Vance (Hall A Main Stage)\n• **Panel Session**: *"Global Tech Expo Scaling & Digital Pass Ecosystems"*\n• **Interactive Track**: *"Robotics Demo & Live Exhibitor Pitch Arena"*\n\nYou can bookmark these directly in the **Live Schedule Manager** to sync with your personal calendar.`;
            } else if (lowerMsg.includes("application") || lowerMsg.includes("lead") || lowerMsg.includes("exhibitor") || lowerMsg.includes("setup")) {
                dynamicAnswer = `Here are actionable **Exhibitor Operational Recommendations**:\n\n• **Application Triage**: Review pending applications in the **Exhibitor Applications Manager** to approve vendor booth credentials.\n• **Lead Generation**: Equip your booth staff with the digital badge scanner to capture attendee profiles instantly.\n• **Booth Setup**: Premium Corner & Island booths include high-speed Gigabit LAN, dual 220V power drops, and digital display mounts.`;
            } else {
                dynamicAnswer = `I have analyzed your request regarding **"${lastUserMsg}"** in **EventSphere**:\n\n• **Real-Time Data**: Active summits, floor maps, and session timetables are fully synced.\n• **Quick Action**: Use the navigation sidebar to jump between **Floor Plans**, **Digital QR Passes**, and **Exhibitor Showcases**.\n• **Assistance**: Feel free to ask about any expo logistics, booth reservations, or schedule tracks!`;
            }

            return res.json({
                reply: `${dynamicAnswer}\n\n*(Gemini Live Intelligence: Add \`GEMINI_API_KEY\` in your \`.env\` file for full real-time model synthesis)*`,
                modelUsed: 'offline-smart-simulation',
            });
        }
        const selectedModel = model || 'gemini-2.5-flash';
        // Format chat history into contents format
        const contents = messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));

        let response;
        let usedModel = selectedModel;
        try {
            response = await ai.models.generateContent({
                model: selectedModel,
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                },
            });
        } catch (genErr) {
            console.warn(`[Gemini API] Call with ${selectedModel} failed (${genErr?.message}), trying fallback to gemini-2.5-flash...`);
            try {
                usedModel = 'gemini-2.5-flash';
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: contents,
                    config: {
                        systemInstruction: systemInstruction,
                        temperature: 0.7,
                    },
                });
            } catch (fallbackErr) {
                console.warn(`[Gemini API] Fallback to gemini-2.5-flash failed, trying gemini-2.0-flash...`);
                usedModel = 'gemini-2.0-flash';
                response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: contents,
                    config: {
                        systemInstruction: systemInstruction,
                        temperature: 0.7,
                    },
                });
            }
        }

        const replyText = response?.text || 'I could not generate a response. Please try again.';
        res.json({
            reply: replyText,
            modelUsed: usedModel,
        });
    }
    catch (error) {
        console.error('Error in /api/chat Gemini endpoint:', error);
        res.status(500).json({
            error: error?.message || 'Failed to generate response from Gemini AI',
        });
    }
});

// Vite middleware & Static serving
async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    }
    else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`EventSphere Server running on port ${PORT}`);
    });
}
startServer();
