import 'dotenv/config';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { optimism } from 'viem/chains';
import { BundlerAbi, IdGatewayAbi } from '../ABIs/Abis';
import { ViemLocalEip712Signer } from '@farcaster/hub-nodejs';
import { keyGateWayAbi } from '../ABIs/keyGatewayAbi';

const OWNER = "0x33b8287511ac7F003902e83D642Be4603afCd876";
const SIGNER = process.env.SIGNER; // <REQUIRED>
const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    name: "Farcaster SignedKeyRequestValidator",
    version: "1",
    chainId: 10, // OP Mainnet
    verifyingContract: process.env.SIGNED_KEY_REQUEST_VALIDATOR,
} as const;

const BUNDLER = "0x00000000FC04c910A0b5feA33b03E0447AD0B0aA";
const IDGATEWAY = "0x00000000Fc25870C6eD6b6c7E41Fb078b7656f69";
const KEYGATEWAY = "0x00000000fc56947c7e7183f8ca4b62398caadf0b";

const main = async () => {
    // Users need to set a recovery address
    const recovery = "0x9143743c4a54fdCF81f38e2370A4e9819E98797c";

    // Client need to decide a signer for user
    const requestFid = 194467;
    const newSignerPubKey = "0x0c4d92e149cc48735b7a72f6cf63eff62609cd09591bf805a4af25f189ae9d76";

    // Initialize viem clients
    const publicClient = createPublicClient({
        chain: optimism,
        transport: http()
    });
    const account = privateKeyToAccount(SIGNER);
    const walletClient = createWalletClient({
        account,
        chain: optimism,
        transport: http()
    });

    console.log("Params of Bundler.register()");

    // Get price of storage
    const price = await publicClient.readContract({
        address: BUNDLER,
        abi: BundlerAbi,
        functionName: 'price',
        args: [0]
    });
    console.log(`1. payableAmount: ${price} wei`);

    // Get registerParams
    const to = OWNER;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
    const extraStorage = 0;
    const nonce = await publicClient.readContract({
        address: IDGATEWAY,
        abi: IdGatewayAbi,
        functionName: 'nonces',
        args: [to]
    });
    const signature1 = await walletClient.signTypedData({
        domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
        types: {
            SignedKeyRequest: [
                { name: "to", type: "address" },
                { name: "recovery", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ],
        },
        primaryType: "SignedKeyRequest",
        message: {
            to,
            recovery,
            nonce: BigInt(nonce),
            deadline: BigInt(deadline),
        },
    });
    console.log(`2. registerParams: [${to}, ${recovery}, ${deadline}, ${signature1}, ${extraStorage}]`);

    // Get signersPrams[]
    const viemEip712Signer = new ViemLocalEip712Signer(account);
    const keyType = 1;
    const key = newSignerPubKey;
    const deadline2 = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
    const metadataType = 1;
    const metadata = await viemEip712Signer.getSignedKeyRequestMetadata({
        requestFid: BigInt(requestFid),
        key,
        deadline: BigInt(deadline2)
    });
    const nonce2 = await publicClient.readContract({
        address: KEYGATEWAY,
        abi: keyGateWayAbi,
        functionName: 'nonces',
        args: [to]
    });
    const signature2 = await viemEip712Signer.signAdd({
        owner: OWNER,
        keyType,
        key,
        metadataType,
        metadata,
        nonce: nonce2,
        deadline: BigInt(deadline2)
    });
    console.log(`3. signersPrams[]: [[${keyType}, ${newSignerPubKey}, ${metadataType}, ${metadata}, ${deadline2}, ${signature2}]]`);

    console.log(`4. extraStorage: ${extraStorage}`);
};

main();
