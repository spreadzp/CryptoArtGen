# Prompt2Image NFTs
To test it run in the browser next url:
```
https://crypto-art-gen-spread.vercel.app
```

## To see how its work
```
https://youtu.be/yIqJ4rUc8i0
```

Inspiration
As an AI and blockchain enthusiast, I was inspired to create "Prompt2Image NFTs" by the potential for these technologies to transform the art world. I saw an opportunity to leverage the power of AI to generate unique art pieces, and to link them securely to NFTs on the blockchain. I was motivated to build a platform that would provide designers, artists, and prompt engineers with a seamless user experience, making it easy for them to monetize their work and connect with art collectors.

What it does
"Prompt2Image NFTs" is an NFT marketplace that offers unique art pieces generated by AI through prompts linked to encrypted NFTs.

"Prompt2Image NFTs" is an NFT marketplace built on the Fantom blockchain that utilizes AI technology to generate unique art pieces that are linked to encrypted NFTs. The platform offers a seamless user experience that allows users to buy and sell NFTs linked to AI-generated images through prompts.

When a user mints an NFT on "Prompt2Image NFTs", the prompt used to generate the image is encrypted via symmetrical encryption using a randomly generated secret. The secret is then encrypted again using the public key of the Metamask wallet of the minter's NFT, using asymmetrical encryption. This ensures that only the owner of the NFT can decrypt the prompt and generate new images linked to the NFT.

When a user purchases an NFT on "Prompt2Image NFTs", the encrypted secret is saved in the NFT smart contract. To ensure secure transfer of ownership, the app decrypts the secret using the private key of the seller's Metamask wallet and re-encrypts it using the public key of the buyer's wallet.

The platform offers a user-friendly dashboard that displays images generated by AI through prompts linked to NFTs. Users can purchase the right to generate a new image based on the prompt linked to the NFT. However, the user can only generate new images once they become the owner of the NFT, as they need to decrypt the prompt using their Metamask wallet's private key. In summary, "Prompt2Image NFTs" is an innovative NFT marketplace that combines AI technology with secure encryption methods to offer unique art pieces linked to NFTs.
## Getting Started

First, run the development server:

## Create .env file with field
```
NEXT_PUBLIC_IPFS_KEY=
NEXT_PUBLIC_IPFS_SECRET=

```

```bash
npm run dev
# or
yarn dev
```
 

## Deploy on Vercel run 
```
vercel
```
