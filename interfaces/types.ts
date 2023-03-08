export interface NFTProps {
    maxPrice?: number,
    totalSum?: number,
    buyers?: BuyersList[],
    price?: any,
    tokenId: number,
    seller?: string,
    owner?: string,
    image?: string,
    decodedImage?: string, 
    encodedInfo: string,
    encodedPrompt?: string,
    decodedPrompt?: string,
    name?: string,
    description?: string,
}


export interface BuyersList {
    buyerAddress: string,
    buyerBet: string,
    buyerPublicKey: string,
    goalOfPurchase: string
}

export interface EncodedInfoFromNft {
    encData: string,
    owner: string
}

export enum ACTOR {
    All,
    MyListed,
    MyAll,
    Marketplace
}

export interface ResponseLoadNfts {
    nfts: NFTProps[],
    currentAddress: string,
    marketPlaceContract: any,
    encNftContract: any
}

export interface Web3InstanceProps { 
    currentAddress: string,
    marketPlaceContract: any,
    encNftContract: any,
    web3Utils: any
}

export interface NftInfo {
    listed: boolean,
    nftContract: string,
    owner: string,
    price: string,
    seller: string,
    tokenId: string
}