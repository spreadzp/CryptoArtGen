'use client';

import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Web3 from 'web3';
import { Web3InstanceProps } from "../interfaces/types"
import { getWeb3Instance } from "../utils/web3"
import Loader from "./loader"

function SoldBoard() {
    const router = useRouter()
    const headerNames = ['#', 'NFT ID', 'Show NFT', 'Sum to withdraw', 'Action']
    const [marketPlaceContract, setMarketPlaceContract] = useState(null || {} as any)
    const [encodedNftContract, setEncodedNftContract] = useState(null || {} as any) 
    const [account, setAccount] = useState('')
    const [soldNfts, setSoldNfts] = useState([] as SoldNft[])
    const [idsHistory, setIdsHistory] = useState([] as string[])
    const [isWithdraw, setIsWithdraw] = useState(false)
    type SoldNft = {
        id: string,
        soldSum: string,
        currentOwner: string
    } 

    useEffect(() => {
        getWeb3Instance()
            .then((inst: Web3InstanceProps) => {
                setAccount(inst.currentAddress)
                setMarketPlaceContract(inst.marketPlaceContract)
                setEncodedNftContract(inst.encNftContract)
            }).catch((err: any) => {
                console.log('err', err)
            })
    }, [])

    useEffect(() => {
        if (encodedNftContract.toString() !== '{}' && account) {
            encodedNftContract.methods?.getIdsByOwner(account).call()
                .then((ids: string[]) => {
                    //console.log("🚀 ~ file: sold-board.tsx:39 ~ .then ~ ids", ids)
                    setIdsHistory(() => [...idsHistory, ...ids])
                })
        }

    }, [encodedNftContract, account ]);

    useEffect(() => {
        (async () => {

            const nfts = await Promise.all(idsHistory?.map(async (id: string) => {
                const balance = await marketPlaceContract.methods.getOwnerInfo(id, account).call()
                const currentOwnerInfo = await encodedNftContract.methods.getTokenInfoLastOwner(id).call()
                const nftInfo: SoldNft = { id: id, currentOwner: currentOwnerInfo.owner, soldSum: Web3.utils.fromWei(balance) }
                return nftInfo
            }))
            setSoldNfts(() => [...soldNfts, ...nfts])
        })()

    }, [idsHistory, account]);
    const makeAction = async (nft: SoldNft) => {
        try {
            setIsWithdraw(true)
            await marketPlaceContract.methods.sellerWithdrawSum(nft.id)
                .send({ from: account }).on('receipt', function () { 
                    alert('withdraw successfully') 
                })
        } catch (err) {
            console.log("🚀 ~ file: sold-board.tsx:73 ~ makeAction ~ err", err)
            setIsWithdraw(false)
        } finally {
            setIsWithdraw(false) 
            router.push(`/`)
        }
    }
    const showNft = (nft: SoldNft) => {
        router.push(`/nft-market/${nft.id}`)
    }
    return (<>
        {isWithdraw ? <Loader /> :
            <div className="flex flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="border-b">
                                    <tr>
                                        {headerNames.map((name: string, ind: number) => {
                                            return (<th key={ind + 50} scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                                                {name}
                                            </th>)
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {soldNfts?.length > 0 && soldNfts.map((item: SoldNft, ind: number) => {
                                        return (
                                            <>
                                                <tr className="border-b" key={ind}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{ind + 1}</td>
                                                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                                                        {item.id}
                                                    </td>
                                                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                                                        <button className="px-6 board-btn rounded" onClick={() => showNft(item)}>
                                                            Show the NFT
                                                        </button>
                                                    </td>
                                                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                                                        {item.soldSum} ETH
                                                    </td>
                                                    {item.currentOwner !== account ? +item.soldSum > 0 ?
                                                        <td className="text-sm text-white font-light  whitespace-nowrap">
                                                            <button className="px-6 board-btn rounded" onClick={() => makeAction(item)}>
                                                                Withdraw sum
                                                            </button>
                                                        </td> : <td className="whitespace-nowrap text-white">
                                                            Sum was withdrew
                                                        </td> : <td className="whitespace-nowrap text-white">
                                                        For sell now
                                                    </td>}

                                                </tr>
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
        }
    </>);
}

export default SoldBoard;