'use client';

import { useRouter } from "next/router"
import { useEffect, useState } from "react" 
import { ACTOR, ResponseLoadNfts, NFTProps } from "../interfaces/types"
import { loadNFTs } from "../utils/nft-commands"; 
import Loader from "./loader"

function Rates() {
    const router = useRouter()
    const headerNames = ['#', 'NFT ID', 'Show NFT', 'My current bet', 'Action']
    const [marketPlaceContract, setMarketPlaceContract] = useState(null || {} as any) 
    const [ids, setIds] = useState([] as number[])
    const [isWithdraw, setIsWithdraw] = useState(false)
    const [nfts, setNfts] = useState([] as NFTProps[])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [account, setAccount] = useState('')

    type SoldNft = {
        id: string,
        soldSum: string,
        currentOwner: string
    }
    useEffect(() => {
        (async () => {
          const resLoad: ResponseLoadNfts = await loadNFTs({ typeAction: ACTOR.All })
          const notOwnedNft = resLoad.nfts.filter((item: NFTProps) => item?.owner !== resLoad.currentAddress)
          console.log("🚀 ~ file: rates.tsx:31 ~ notOwnedNft", notOwnedNft)
          setNfts(notOwnedNft) 
          const notOwnedIds = notOwnedNft.map((item: NFTProps) => item?.tokenId)
          setIds(notOwnedIds)
          setAccount(resLoad.currentAddress)
          setMarketPlaceContract(resLoad.marketPlaceContract) 
          setLoadingState('loaded')
        })()
      }, []) 
 
    const makeAction = async (nft: NFTProps) => {
        try {
            setIsWithdraw(true)
            await marketPlaceContract.methods.sellerWithdrawSum(nft.tokenId)
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
    const showNft = (nft: NFTProps) => {
        router.push(`/nft-market/${nft?.tokenId}`)
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
                                    {nfts?.length > 0 && nfts.map((item: NFTProps, ind: number) => {
                                        return (
                                            <>
                                                <tr className="border-b" key={ind}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{ind + 1}</td>
                                                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                                                        {item?.tokenId}
                                                    </td>
                                                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                                                        <button className="px-6 board-btn rounded" onClick={() => showNft(item)}>
                                                            Show the NFT
                                                        </button>
                                                    </td>
                                                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                                                        {item?.totalSum} ETH
                                                    </td>
                                                    {item?.owner !== account ? Number(item?.totalSum) > 0 ?
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

export default Rates;