import { Wallet } from 'ethers';
import 'dotenv/config';

import { CLIENT } from './client';

// Docs: https://tomodachi.masato25.com/swagger/index.html

interface Data {
    embeds: {
        json: {
            RawMessage: number[];
        };
    };
    mentions: {
        json: {
            RawMessage: number[];
        };
    };
    mentions_positions: {
        json: {
            RawMessage: number[];
        };
    };
    text: string;
    timestamp: number;
};

const createSignature = async (address, privateKey) => {
    const message = `${address}#${0}`;
    const wallet = new Wallet(privateKey);
    try {
        const signature = await wallet.signMessage(message);
        return signature;
    } catch (error) {
        console.error("Error creating signature:", error);
        throw error;
    }
};

const shadowboxUploadCast = async (data: Data) => {
    const apiUrl = `${process.env.SHADOW_BOX_URL}/shadow_box/cast/post`;
    
    try {
        const signature = await createSignature(CLIENT.SIGNER_ADDERSS, CLIENT.SIGNER_KEY);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': signature,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response;
    } catch (error) {
        console.error("Error uploading data:", error);
        throw error;
    };
};

const shadowboxUploadImage = async () => {

};

const shadowboxTests = async () => {
    const testData = {
        text: "example text text text text text text text text text text text text",
        embeds: { json: { RawMessage: [0] } },
        mentions: { json: { RawMessage: [0] } },
        mentions_positions: { json: { RawMessage: [0] } },
        timestamp: Date.now()
    };

    try {
        const response = await shadowboxUploadCast(testData);
        const responseBody = await response.json();
        console.log(response.status, responseBody);
    } catch (error) {
        console.error("Error in Tests", error);
    }
};

shadowboxTests();

export { shadowboxUploadCast, shadowboxUploadImage };
