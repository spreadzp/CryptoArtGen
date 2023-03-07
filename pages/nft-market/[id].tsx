'use client';

import { useRouter } from 'next/router'
import Web3 from 'web3';
import { useEffect, useState } from 'react';
import Board from '../board';
import { getPublicKeyViaMetamask } from '../../utils/metamask';
import { ACTOR, BuyersList, NFTProps } from '../../interfaces/types';
import NftCard from '../nft-card';
import { loadNFTs } from '../../utils/nft-commands';
import { getWeb3Instance } from '../../utils/web3';
import Loader from '../loader';


function NftMarket() {
  const bList: BuyersList[] = []
  const router = useRouter()
  const { id } = router.query
  const [nft, setNft] = useState({} as NFTProps)
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [account, setAccount] = useState('')
  const [nftId, setNftId] = useState(+`${id?.toString()}`)
  const [formInput, updateFormInput] = useState({ price: '', address: '', publicKey: '', goalPurchase: '' })
  const [buyersList, setBuyersList] = useState(bList)
  const [isBetting, setIsBetting] = useState(false)

  useEffect(() => {
    if (nftId) {
      const loadNFTInfo = async () => {
        const resLoad = await loadNFTs({ typeAction: ACTOR.Marketplace, nftId: nftId })
        console.log("🚀 ~ file: [id].tsx ~ line 33 ~ loadNFTInfo ~ resLoad", resLoad.nfts[0])
        setNft(resLoad.nfts[0])
        setAccount(resLoad.currentAddress)
        console.log('resLoad?.nfts[0]?.buyers', resLoad?.nfts[0]?.buyers)
        setBuyersList(resLoad?.nfts[0]?.buyers as BuyersList[])
        // setMarketPlaceContract(resLoad.marketPlaceContract)
        setLoadingState('loaded')

      }
      loadNFTInfo()
    }
  }, [nftId]);

  async function makeBet(nft: NFTProps) {
    const { price, address, publicKey, goalPurchase } = formInput;
    const { marketPlaceContract } = await getWeb3Instance()
    setIsBetting(true)
    const resBet = await marketPlaceContract?.methods?.makeBet(nft.tokenId, publicKey, account, goalPurchase).send({
      from: account,
      value: Web3.utils.toWei(price, "ether"), gasPrice: 1 * 10 ** 10, 
    }).on('receipt', function () {
      console.log('make bet')
    });

    if (resBet) {
      setIsBetting(false)
      router.push(`/`)
    }
  }

  const setPublicKey = async (account: string) => {
    const pubKey = await getPublicKeyViaMetamask(account)
    updateFormInput({ ...formInput, publicKey: pubKey })
  }
  if (loadingState !== 'loaded') {
    return (<h1 className="px-20 py-10 text-3xl">No nfts available!</h1>)
  } else {
    return (
      <div className='brand-bg'>
        <h1 className="flex justify-center px-20 py-10 text-3xl brand-color ">Auction board</h1>
        <div className="flex justify-center">
          <div className="px-4"  >
            <div  >
              <div className="border shadow rounded-xl overflow-hidden">
                <NftCard nftItem={nft} index={1} userAddress={account} />

                {account !== nft?.seller &&
                  <div className="flex justify-center brand-bg  flex-col p-3  ">

                    <label htmlFor="bet" className='text-xl font-bold text-white' >Your bet for the NFT </label>
                    <input
                      name="bet"
                      type="number"
                      min={+nft.price}
                      placeholder="Your bet in Eth"
                      className="mt-2 border rounded p-4"
                      onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                    />

                    {!formInput.publicKey ?
                      <button type="button" className="font-bold mint-btn  rounded mt-10 p-4 shadow-lg" onClick={() => setPublicKey(account)}>
                        Set your account public key</button> :
                      <div className="mt-2 border text-white rounded p-4">{formInput.publicKey}</div>}
                    <label htmlFor="opus" className='text-xl font-bold text-white' >If you want, type about this investment </label>
                    <input
                      type="opus"
                      placeholder="Goal purchase"
                      className="mt-2 border rounded p-4"
                      onChange={e => updateFormInput({ ...formInput, goalPurchase: e.target.value })}
                    />
                    {isBetting ? <Loader /> :
                      <button type="button" className="font-bold mint-btn text-white rounded mt-10 p-4 shadow-lg" onClick={() => makeBet(nft)}>Make bet</button>}

                  </div>}
              </div>
            </div>

          </div>
          {buyersList?.length > 0 && <Board nft={nft} buyers={buyersList} />}
        </div>

      </div>);
  }
}

export default NftMarket;