import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { optimism } from 'viem/chains';
import 'dotenv/config';

const SIGNER = process.env.SIGNER; // <REQUIRED>

const fid = 194467;
const fidOwner = "0x33b8287511ac7F003902e83D642Be4603afCd876";
const newSignerPubKey = "0x0c4d92e149cc48735b7a72f6cf63eff62609cd09591bf805a4af25f189ae9d76";

const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    name: "Farcaster SignedKeyRequestValidator",
    version: "1",
    chainId: 10, // OP Mainnet
    verifyingContract: process.env.SIGNED_KEY_REQUEST_VALIDATOR,
} as const;

const main = async () => {
    // Initialize wallet
    const account = privateKeyToAccount(SIGNER);
    const walletClient = createWalletClient({
        account,
        chain: optimism,
        transport: http()
    });

    // Get deadline
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now

    // Get signature
    // Sign a EIP-712 message using the account that holds the FID to authorize adding this signer to the key registry
    const signedMetadata = await walletClient.signTypedData({
        domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
        types: {
            SignedKeyRequest: [
                { name: "requestFid", type: "uint256" },
                { name: "key", type: "bytes" },
                { name: "deadline", type: "uint256" },
            ],
        },
        primaryType: "SignedKeyRequest",
        message: {
            requestFid: BigInt(fid),
            key: newSignerPubKey,
            deadline: BigInt(deadline),
        },
    });
    console.log("sig: ", signedMetadata);
    console.log("request id", fid);
    console.log("request signer", fidOwner);
    console.log("deadline: ", deadline);
    console.log(`Metadata: [${fid}, "${fidOwner}", "${signedMetadata}", ${deadline}]`);
};

main();
