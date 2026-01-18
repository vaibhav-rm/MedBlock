import { create } from 'ipfs-http-client';
import axios from 'axios';

// 1. Setup IPFS View Gateway (Public)
// Using a public gateway ensures files can be viewed even if the local node is down
// Note: Public gateways can be slow. For production, use a dedicated gateway.
// Switched to Cloudflare for better reliability and performance
const IPFS_GATEWAY = "https://cloudflare-ipfs.com/ipfs/";

// 2. Pinata Configuration (For Uploads without a local node)
// You need to get these keys from https://app.pinata.cloud/keys
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY;

// 3. Fallback to Local Node (for development)
const localClient = create({ url: 'http://localhost:5001/api/v0' });

export const uploadFileToIPFS = async (file) => {
    // Strategy: Try Pinata first (Production), then Local Node (Development)

    if (PINATA_API_KEY && PINATA_SECRET_KEY) {
        try {
            console.log("Uploading via Pinata...");
            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxBodyLength: "Infinity",
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY
                }
            });

            console.log(`File uploaded to Pinata! CID: ${res.data.IpfsHash}`);
            return res.data.IpfsHash;

        } catch (error) {
            console.error("Pinata Upload Error:", error);
            alert("Pinata upload failed. Check console.");
            throw error;
        }
    } else {
        // Fallback to Local Node
        try {
            console.log("Pinata keys missing. Trying Local Node (http://localhost:5001)...");
            const added = await localClient.add({
                path: file.name,
                content: file,
            });
            console.log(`File uploaded to Local Node! CID: ${added.cid.toString()}`);
            return added.cid.toString();
        } catch (error) {
            console.error("Local IPFS Error:", error);
            alert("Upload failed. IPFS keys missing and Local Node unreachable.");
            throw error;
        }
    }
};

export const viewFile = async (fileCID) => {
    try {
        // Use the public gateway
        const fileUrl = `${IPFS_GATEWAY}${fileCID}`;
        console.log(`Opening file from ${fileUrl}`);

        // Open the file in the default browser (new tab)
        window.open(fileUrl, '_blank');
    } catch (error) {
        console.error('Error viewing file:', error);
        alert(`Error: ${error.message}`);
    }
};
