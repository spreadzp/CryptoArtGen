'use client';

import { useEffect, useState } from 'react';
 
import { ACTOR,  ResponseLoadNfts } from '../interfaces/types';
import NftCard from './nft-card';
import { loadNFTs } from '../utils/nft-commands';

export default function MyListedNft() {
  const [nfts, setNfts] = useState([] as any[])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [account, setAccount] = useState('')

  useEffect(() => { 
    (async() => {
      const resLoad: ResponseLoadNfts = await loadNFTs({typeAction:ACTOR.MyListed}) 
      setNfts(resLoad.nfts)
      setAccount(resLoad.currentAddress)
      setLoadingState('loaded')
    })() 
  }, []) 
  if (loadingState === 'loaded' && !nfts?.length) {
    return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)
  } else {
    return (
      <div className='brand-bg'>
        <div className="p-4">
          <h2 className="text-2xl py-2  font-bold text-white">Items Listed NFTs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i}>
                <NftCard nftItem={nft} index={i} userAddress={account} />
                </div>  
              ))
            }
          </div>
        </div>
      
      </div>
    )
  }
}