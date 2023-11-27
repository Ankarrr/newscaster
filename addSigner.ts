import { createWalletClient, createPublicClient, http, encodeAbiParameters, getContract } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { optimism } from 'viem/chains';
import {
    NobleEd25519Signer,
} from "@farcaster/hub-nodejs";
import { hexToBytes } from "@noble/hashes/utils";
import 'dotenv/config';

import { keyGateWayAbi } from "./ABIs/keyGatewayAbi";

const SIGNER = process.env.SIGNER; // <REQUIRED>

const fid = 194467;
const fidOwner = "0x33b8287511ac7F003902e83D642Be4603afCd876";
const keyType = 1;
const metadataType = 1;
const newSigner = "0x9D2CEE4c8A3382f66CB2b45ce045b3daFc4Fc1fA";
const newSignerPubKey = "0x0c4d92e149cc48735b7a72f6cf63eff62609cd09591bf805a4af25f189ae9d76";
const keyGateway = "0x00000000fc56947c7e7183f8ca4b62398caadf0b";

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
    const publicClient = createPublicClient({ 
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

    // TODO: encode metadata
    // 根據：https://github.com/farcasterxyz/contracts/blob/main/src/validators/SignedKeyRequestValidator.sol#L32C1-L37C6
    // struct SignedKeyRequestMetadata {
    //     uint256 requestFid;
    //     address requestSigner;
    //     bytes signature;
    //     uint256 deadline;
    // }

    // TODO: Create contract instance

    // TODO: Send tx
};

main();
