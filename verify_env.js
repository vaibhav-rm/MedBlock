require('dotenv').config();

const key = process.env.REACT_APP_PINATA_API_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET_API_KEY;

if (key && secret) {
    if (key.startsWith('eyJ')) {
        console.log("✅ PINATA JWT detected (Good).");
    } else {
        console.log("✅ PINATA API Key detected.");
    }
    console.log("✅ Environment variables loaded correctly.");
} else {
    console.error("❌ Missing Pinata Keys in .env file.");
    if (!key) console.error("   - REACT_APP_PINATA_API_KEY is missing");
    if (!secret) console.error("   - REACT_APP_PINATA_SECRET_API_KEY is missing");
    process.exit(1);
}
