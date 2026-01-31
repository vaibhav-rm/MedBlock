import { Buffer } from 'buffer';

const IPFS_GATEWAY = "https://cloudflare-ipfs.com/ipfs/";
const LOCAL_IPFS_API = "http://10.0.2.2:5001/api/v0"; // Android Emulator

export const uploadFileToIPFS = async (fileUri: string, fileName: string, mimeType: string) => {
    try {
        console.log("Uploading to IPFS...", fileUri);

        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
            uri: fileUri,
            name: fileName,
            type: mimeType
        });

        // Use fetch for local node
        const response = await fetch(`${LOCAL_IPFS_API}/add`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            throw new Error(`IPFS Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Uploaded CID:", data.Hash);
        return data.Hash;

    } catch (error) {
        console.error("IPFS Upload Error:", error);
        throw error;
    }
};

export const getIpfsUrl = (cid: string) => {
    return `${IPFS_GATEWAY}${cid}`;
};
