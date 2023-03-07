'use client';
import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { BuyersList, NFTProps } from "../interfaces/types";
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import EncodedNft from '../contracts/ethereum-contracts/ENCNFT.json'
import { decryptPrivateKey, metamaskEncrypt } from "../utils/metamask";

type BoardProps = {
    nft: NFTProps,
    buyers: BuyersList[]
}

function Board({ nft, buyers }: BoardProps) {
    const router = useRouter()
    const headerNames = ['#', 'Bet', 'Buyers addresses', 'Message', 'Action']
    const [marketPlaceContract, setMarketPlaceContract] = useState(null || {} as any)
    const [encodedNftContract, setEncodedNftContract] = useState(null || {} as any)
    const [isOwner, setIsOwner] = useState(false)
    const [account, setAccount] = useState('')
    useEffect(() => {
        const loadNFTInfo = async () => {
            const web3Modal = new Web3Modal()
            const provider = await web3Modal.connect()
            const web3 = new Web3(provider)
            const networkId = await web3.eth.net.getId()
            const accounts = await web3.eth.getAccounts();
            console.log("🚀 ~ file: index.tsx ~ line 20 ~ loadNFTs ~ networkId", networkId)
            setAccount(accounts[0])
            // Get all listed NFTs
            const marketPlaceContract = new web3.eth.Contract(Marketplace.abi as any, Marketplace.networks[`${networkId}` as keyof typeof Marketplace.networks]?.address)
            setMarketPlaceContract(marketPlaceContract)
            const encodedNftContract = new web3.eth.Contract(EncodedNft.abi as any, EncodedNft.networks[`${networkId}` as keyof typeof EncodedNft.networks]?.address)
            setEncodedNftContract(encodedNftContract)
        }
        loadNFTInfo()
    }, [nft, buyers])

    useEffect(() => {
        nft.seller === account ?
            setIsOwner(true) :
            setIsOwner(false)
    }, [account, nft]);
    const makeAction = async (playerInfo: BuyersList) => {
        if (isOwner) { 
            const ownerOfTokenInfo = await encodedNftContract.methods.getTokenInfoLastOwner(nft.tokenId).call({ from: account });

            const lastEncryptedPrivateKey = ownerOfTokenInfo.encData
                console.log("🚀 ~ file: board.tsx ~ line 47 ~ makeAction ~ lastEncryptedPrivateKey", lastEncryptedPrivateKey)
                const decryptedPrivateKey = await decryptPrivateKey(lastEncryptedPrivateKey,  account ) 
                console.log("🚀 ~ file: board.tsx:53 ~ makeAction ~ decryptedPrivateKey", decryptedPrivateKey)
                let approvedAddress = await encodedNftContract.methods.getApproved(nft.tokenId).call() 
                if(approvedAddress !== marketPlaceContract._address) {

                    let approved = await encodedNftContract.methods.approve(marketPlaceContract._address, nft.tokenId).send({
                        from:  account,
                        gasLimit: 150000
                      }) 
                }
                if (decryptedPrivateKey) {
                    const encData = await metamaskEncrypt(decryptedPrivateKey, playerInfo.buyerPublicKey) 
                    // const encData = await encryptData(accounts[0], newPrivateKey)
                    console.log("🚀 ~ file: board.tsx:63 ~ makeAction ~ encData", encData)
                await marketPlaceContract.methods.acceptRateAndTransferToken( nft.tokenId,  playerInfo.buyerAddress, encData).send({ 
                        from: account// , gasPrice: 1 * 10 ** 10, gaslimit: 750000 //  , value: playerInfo.buyerBet
                    }).on('receipt', function (receipt: any) { 
                        console.log('accepted');
                        // List the NFT
                        router.push(`/`)
                    })
            }
        } else {
            await marketPlaceContract.methods.buyerWithdrawBet(nft.tokenId).send({
                from: account, gasPrice: 10 * 10 ** 10 
              }).on('receipt', function (receipt: any) {
                console.log("🚀 ~ file: board.tsx ~ line 45 ~ await marketPlaceContract.methods.acceptRateAndTransferToken ~ receipt", receipt)
                console.log('buyerWithdrawBet');
                router.push(`/nft-market/${nft.tokenId}`)
              })
        }
    }
    return (<>
        <div className="flex flex-col">
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b">
                                <tr> 
                                    {headerNames.map((name: string, index: number) => {
                                          return (<th key={index + 50 } scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                                          {name}
                                      </th>)
                                    })} 
                                </tr>
                            </thead>
                            <tbody>
                                {buyers?.length > 0 && buyers.map((item: BuyersList, ind: number) => {
                                    return (
                                        <>
                                            {item.buyerAddress !== nft.seller &&
                                                <tr className="border-b" key={ind}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{ind + 1}</td>
                                                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                                                        {Web3.utils.fromWei(item.buyerBet)} ETH
                                                    </td>
                                                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                                                        {item.buyerAddress}
                                                    </td> 
                                                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                                                        {item.goalOfPurchase}
                                                    </td>
                                                    {item.buyerAddress === account && <td className="text-sm text-white font-light  whitespace-nowrap">
                                                        <button className="board-btn rounded" onClick={() => makeAction(item)}>
                                                            Remove bet
                                                        </button>
                                                    </td>}
                                                    {isOwner && <td className="whitespace-nowrap">
                                                        <button className="board-btn rounded" onClick={() => makeAction(item)}>
                                                            Accept bet
                                                        </button>
                                                    </td>}

                                                </tr>

                                            }
                                        </>
                                    )
                                })
                                } 
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </>);
}

export default Board;