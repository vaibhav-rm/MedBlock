import { Buffer } from 'buffer';

// Load credentials from environment variables (with fallbacks for development)
const TWILIO_ACCOUNT_SID = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN || '';
const TWILIO_SERVICE_SID = process.env.EXPO_PUBLIC_TWILIO_SERVICE_SID || '';

// Validate that credentials are configured
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_SERVICE_SID) {
    console.warn('Twilio credentials not configured. Please set EXPO_PUBLIC_TWILIO_* environment variables.');
}

// Base URL for Twilio Verify API
const BASE_URL = `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_SID}`;

const getAuthHeader = () => {
    return 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
};

export const TwilioService = {
    sendOTP: async (phone: string) => {
        console.log(`Sending OTP to ${phone} via Twilio...`);

        // Ensure phone has + prefix if missing (Twilio requires E.164)
        // Default to +91 (India) if no country code provided
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.trim()}`;

        try {
            const formData = new URLSearchParams();
            formData.append('To', formattedPhone);
            formData.append('Channel', 'sms');

            const response = await fetch(`${BASE_URL}/Verifications`, {
                method: 'POST',
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Twilio Error Data:", data);
                throw new Error(data.message || 'Failed to send OTP');
            }

            console.log("OTP Sent Status:", data.status);
            return data;
        } catch (error) {
            console.error("Twilio Send Error:", error);
            throw error;
        }
    },

    verifyOTP: async (phone: string, code: string) => {
        console.log(`Verifying OTP for ${phone}...`);

        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.trim()}`;

        try {
            const formData = new URLSearchParams();
            formData.append('To', formattedPhone);
            formData.append('Code', code);

            const response = await fetch(`${BASE_URL}/VerificationCheck`, {
                method: 'POST',
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Twilio Verify Error Data:", data);
                throw new Error(data.message || 'Failed to verify OTP');
            }

            console.log("Twilio Response:", JSON.stringify(data, null, 2));
            console.log("OTP Status:", data.status);

            if (data.status !== 'approved') {
                throw new Error(`Invalid OTP code. Status: ${data.status}`);
            }

            console.log("OTP Verified Successfully!");
            return data;
        } catch (error) {
            console.error("Twilio Verify Error:", error);
            throw error;
        }
    },
};
