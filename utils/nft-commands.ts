import { ACTOR, BuyersList, EncodedInfoFromNft, NftInfo, NFTProps, ResponseLoadNfts } from './../interfaces/types';
import Web3 from 'web3'; 
import axios from 'axios'; 
import { getWeb3Instance } from './web3';

type LoadNftProps = {
    typeAction: ACTOR,
    nftId?: number
}
export async function loadNFTs({typeAction, nftId}: LoadNftProps): Promise<ResponseLoadNfts>     {
     const resWeb3 = await getWeb3Instance() 
     if(resWeb3.currentAddress) {

       const {currentAddress, encNftContract, marketPlaceContract} = resWeb3
       let listings = null;
       if(typeAction === ACTOR.All) {
           listings = await marketPlaceContract?.methods.getListedNfts().call()
       } else if(typeAction === ACTOR.MyListed){
           listings = await marketPlaceContract?.methods.getMyListedNfts().call({from: currentAddress})
       } else if(typeAction === ACTOR.MyAll) {
           listings = await marketPlaceContract?.methods.getMyNfts().call({from: currentAddress})
       } else if(typeAction === ACTOR.Marketplace) { 
           const res = await marketPlaceContract?.methods.getMyListedNft(nftId).call()  
           const [ nftContract, tokenId, owner, seller,  price, listed] = res
           const totalResult: NftInfo = { nftContract, tokenId, owner, seller,  price, listed}
           listings = [totalResult] 
       }
   
       // Iterate over the listed NFTs and retrieve their metadata
       const nfts = await Promise.all(listings?.map(async (i: any) => {
         try { 
           const tokenURI = await encNftContract.methods.tokenURI(i.tokenId).call()
           let bl = {} as BuyersList;
           let encodedTokenInfo = await encNftContract.methods.getTokenInfoLastOwner(i.tokenId).call() 
           const tmpEncData = {} as EncodedInfoFromNft
           tmpEncData.encData = encodedTokenInfo['encData'].toString() 
           tmpEncData.owner = encodedTokenInfo['owner'].toString()  
          
           const bettersList = await marketPlaceContract.methods.getBuyersById(i.tokenId).call() 
           const totalBuyerList: BuyersList[] = []
           let sum = 0;
           let maxBet = 0;
           bettersList.map((item: any) => {
             const [buyerAddress, buyerPublicKey, buyerBet, goalOfPurchase] = item
             bl = { buyerAddress, buyerBet, buyerPublicKey, goalOfPurchase } 
             const bBet = (+Web3.utils.fromWei(bl.buyerBet, "ether")) 
             if (bBet > 0) {
               sum += bBet
               maxBet = maxBet > bBet ? maxBet : bBet
               totalBuyerList.push(bl)
             }
           })  
           totalBuyerList.sort((a, b) => {          
               return +b.buyerBet - +a.buyerBet
           }) 
           const meta = await axios.get(tokenURI) 
           console.log("🚀 ~ file: nft-commands.ts:57 ~ nfts ~ meta", meta)
           const nft: NFTProps = {
             maxPrice: maxBet,
             totalSum: sum,
             buyers: totalBuyerList,
             price: Web3.utils.fromWei(i.price, "ether"),
             tokenId: i.tokenId,
             seller: tmpEncData.owner,
             owner: tmpEncData.owner,
             image: meta.data.image,
             encodedInfo: tmpEncData.encData,
             decodedImage: '',
             name: meta.data.name,
             description: meta.data.description,
             encodedPrompt: meta.data.prompt,
             decodedPrompt: ''
           }
           return nft
         } catch (err) {
           console.log(err)
           return null
         }
       }))
       return {nfts, currentAddress, marketPlaceContract, encNftContract } 
     } else {
      return {} as ResponseLoadNfts
    }
  }