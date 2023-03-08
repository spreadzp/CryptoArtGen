import { Web3InstanceProps } from './../interfaces/types';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import EncodedNft from '../contracts/ethereum-contracts/ENCNFT.json'


export async function getWeb3Instance(): Promise<Web3InstanceProps> {
    try{
        const web3Modal = new Web3Modal()
        const provider = await web3Modal.connect()
        const web3 = new Web3(provider)
        const networkId = await web3.eth.net.getId()
        const accounts = await web3.eth.getAccounts();
        const currentAddress = accounts[0]    
        // Get all listed NFTs
        const deployedId = '250' //Object.keys(EncodedNft.networks)[0]
        console.log("🚀 ~ file: web3.ts:18 ~ getWeb3Instance ~ deployedId:", deployedId)
        if(networkId !== +deployedId) {
            throw Error(`it works for only Fantom network 
            now current networkId ${networkId}`)
        }
      
        const marketPlaceContract = new web3.eth.Contract(Marketplace.abi as any, '0x38650cbbEab719F2C7eB382d8B448D84fAA73934') // Marketplace.networks[`${networkId}` as keyof typeof Marketplace.networks]?.address)
    
        const encodedNftContract = new web3.eth.Contract(EncodedNft.abi as any, '0x7D19E743475c90b1596D10b4Ae9011C7b1186c29') // EncodedNft.networks[`${networkId}` as keyof typeof EncodedNft.networks]?.address)    
    
        return { currentAddress: currentAddress, marketPlaceContract: marketPlaceContract, encNftContract: encodedNftContract, web3Utils: web3.utils }
    } catch(err) {
        console.log('err', err)
        alert(`Need to use Metamask wallet with  Fantom network` )
        return {} as Web3InstanceProps
    }
}