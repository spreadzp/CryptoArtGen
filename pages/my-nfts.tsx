'use client';
import { useEffect, useState } from 'react';

import { ACTOR, ResponseLoadNfts } from '../interfaces/types';
import NftCard from './nft-card';
import { loadNFTs } from '../utils/nft-commands';
import SoldBoard from './sold-board';
import Rates from './rates';

export default function MyListedNft() {
  const [nfts, setNfts] = useState([] as any[])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [account, setAccount] = useState('')
  const [tab, setTab] = useState('Owned NFTs')
  const activeClassA = 'text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500'
  const passiveClassA = 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
  const activeClassSvg = 'text-blue-600 dark:text-blue-500'
  const passiveClassSvg = 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
  const menuData = [
    { headerName: 'Owned NFTs', pathD: "M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { headerName: 'Sold NFTs', pathD: "M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" },
    { headerName: 'My rates', pathD: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  ]
  useEffect(() => {
    (async () => {
      const resLoad: ResponseLoadNfts = await loadNFTs({ typeAction: ACTOR.MyAll })
      setNfts(resLoad.nfts)
      setAccount(resLoad.currentAddress)
      setLoadingState('loaded')
    })()
  }, [])
  if (loadingState === 'loaded' && !nfts?.length) {
    return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)
  } else {
    return (
      <div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            {menuData.map((item: any, ind: number) => {
              return (<li key={ind} className="mr-2 tab-assets">
                <a onClick={() => setTab(item.headerName)} className={`inline-flex p-4 rounded-t-lg border-b-2 ${tab === item.headerName ? activeClassA : passiveClassA} group`} aria-current="page">
                  <svg aria-hidden="true" className={`mr-2 w-5 h-5 ${tab === item.headerName ? activeClassSvg : passiveClassSvg}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d={item.pathD}></path></svg>{item.headerName}
                </a>
              </li>)
            })}

          </ul>
        </div>
        {tab === 'Owned NFTs' && <div className="p-4">
          <h2 className="text-2xl py-2">My owned NFTs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i}>
                  <NftCard nftItem={nft} index={i} userAddress={account} />
                </div>
              ))
            }
          </div>
        </div>}
        {tab === 'Sold NFTs' && <div className="p-4">
          <h2 className="text-3xl">My sold NFTs</h2>
          <SoldBoard />
        </div>
        }
        {tab === 'My rates' && <div className="p-4">
          <h2 className="text-3xl">My current rates</h2>
          <Rates />
        </div>
        }

      </div>
    )
  }
} 
