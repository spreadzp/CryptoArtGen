'use client';

import { useEffect, useState } from 'react';
import { ACTOR, ResponseLoadNfts } from '../interfaces/types';
import NftCard from './nft-card';
import { loadNFTs } from '../utils/nft-commands';

export default function Home() {
  const [nfts, setNfts] = useState([] as any[])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [account, setAccount] = useState('')

  useEffect(() => {
    (async () => {
      const resLoad: ResponseLoadNfts = await loadNFTs({ typeAction: ACTOR.All })
      setNfts(resLoad?.nfts)
      setAccount(resLoad?.currentAddress) 
      setLoadingState(!resLoad.currentAddress ? 'Fail' : resLoad && !resLoad?.nfts?.length ? 'Empty' : 'Loaded')
    })()
  }, [])

  if (loadingState === 'Empty') {
    return (<h1 className="px-20 py-10 text-3xl font-bold text-white">No NFTs available!</h1>)
  } else if (loadingState === 'Fail') {
    return (<h1 className="px-20 py-10 text-3xl font-bold text-white">
      Need to use Metamask wallet with Mumbai network</h1>)
  }
  else if (loadingState === 'Loaded') {
    return (
      <div className="flex justify-center ">

        <div className="px-4" style={{ maxWidth: '1600px' }}>
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
