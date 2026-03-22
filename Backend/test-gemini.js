require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    console.log('--- TEST START ---');
    console.log('Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say hello');
        console.log('SUCCESS:', result.response.text());
    } catch (e) {
        console.log('ERROR:', e.message);
    }
    console.log('--- TEST END ---');
}

test();
