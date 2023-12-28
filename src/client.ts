import { FarcasterNetwork, NobleEd25519Signer, getInsecureClient } from '@farcaster/hub-nodejs';
import 'dotenv/config';
import { hexToBytes } from 'viem';

const USER = {
    FID: 196424,
    OWNER_ADDRESS: "0x9D2CEE4c8A3382f66CB2b45ce045b3daFc4Fc1fA",
};

const CLIENT = {
    HUB_URL: process.env.MAINNET_HUB_URL,
    NETWORK: FarcasterNetwork.MAINNET,
    SIGNER_ADDERSS: "0xA93ed27e769aE0D845fC4CAB2d347b3d1bAa4Ddd",
    SIGNER_KEY: process.env.SIGNER,
};

const client = getInsecureClient(CLIENT.HUB_URL);
// If your client uses SSL and requires authentication.
// const client = getSSLHubRpcClient(HUB_URL);

const privateKeyBytes = hexToBytes(CLIENT.SIGNER_KEY.slice(2));
const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);

export { USER, CLIENT, client, ed25519Signer };
