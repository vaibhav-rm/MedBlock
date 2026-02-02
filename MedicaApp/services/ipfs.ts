import { Buffer } from 'buffer';

const PINATA_API_KEY = process.env.EXPO_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.EXPO_PUBLIC_PINATA_SECRET_API_KEY;
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export const uploadFileToIPFS = async (fileUri: string, fileName: string, mimeType: string) => {
    try {
        console.log("Uploading to Pinata IPFS...", fileUri);

        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
            uri: fileUri,
            name: fileName,
            type: mimeType
        });

        const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: 'POST',
            body: formData,
            headers: {
                // @ts-ignore - React Native handles multipart boundary
                'pinata_api_key': PINATA_API_KEY || '',
                'pinata_secret_api_key': PINATA_SECRET_API_KEY || '',
            } as any,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Pinata Upload failed: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        console.log("Uploaded CID:", data.IpfsHash);
        return data.IpfsHash;

    } catch (error) {
        console.error("IPFS Upload Error:", error);
        throw error;
    }
};

export const getIpfsUrl = (cid: string) => {
    return `${IPFS_GATEWAY}${cid}`;
};
