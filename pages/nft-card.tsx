'use client';

import { useEffect, useState } from 'react';
import Link from "next/link"; 
import { DocumentChartBarIcon, GifIcon, MusicalNoteIcon, DocumentTextIcon, VideoCameraIcon  } from '@heroicons/react/24/solid'
import { NFTProps } from "../interfaces/types";
import { getTemplateByTypeFile } from "../utils/common";
import { decryptPrivateKey } from '../utils/metamask';
import Loader from './loader';
import { useRouter } from 'next/router';
import { decryptByCJ } from '../utils/cypher';

type NftCardProps = {
  nftItem: NFTProps,
  index: number,
  userAddress: string
}
function NftCard({ nftItem, index, userAddress }: NftCardProps) { 
  const [nft, setNft] = useState(nftItem)
  // const [base64Img, setbase64Img] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [expandedPrompt, setExpandedPrompt] = useState(false)
  const handledDescription = nft?.description?.split(';') ?? ['']
  const [isLoadedContent, setIsLoadedContent] = useState(false)
  const router = useRouter()
  useEffect(() => {
    if(nft?.image){ 
 
        const getImg = async (url: string) => {

          const response = await fetch(url)
       
            console.log("🚀 ~ file: nft-card.tsx:30 ~ .then ~ response", response)
            if (!response.ok || !response) {
              throw new Error('Response was not ok.');
              }
       
              const reader = response?.body?.getReader()
              // const contentLength = +(response?.headers['get']('Content-Length') ?? '0');
              let chunks = [];
              let receivedLength = 0;
              while (true) {
                const nextChunk = await reader?.read()
                if(nextChunk) {
                  const { done, value } = nextChunk; 
                  if (done) {
                      break;
                  } 
                  chunks.push(value);
                  receivedLength += value.length; 
                }
                
            } 
            let chunksAll = new Uint8Array(receivedLength); 
            let position = 0;
            for (let chunk of chunks) {
                chunksAll.set(chunk, position);  
                position += chunk.length;
            }
        
           
            let result = new TextDecoder("utf-8").decode(chunksAll); 
         
            //setbase64Img(result)
            nft.decodedImage = result
        } 
        getImg(nft.image)  
      } 
    
  }, [nft]); 
 
  const decryptData = async (nft: NFTProps) => {
    try{
      setIsLoadedContent(true)
      console.log('nft.encodedInfo', nft.encodedInfo)
      const dk = await decryptPrivateKey(nft.encodedInfo, userAddress);
  
      if (dk ) {
        console.log("🚀 ~ file: nft-card.tsx:28 ~ decryptData ~ dk", dk)
        const encodedPrompt = nft.encodedPrompt;
        if(encodedPrompt && nft?.decodedPrompt) {
          const decPrompt = decryptByCJ(encodedPrompt, dk);
          nft.decodedPrompt = decPrompt;
          setNft(nft)
        }
 
      }
    } catch (err: any) {
      console.log('err', err)
    } finally{
      setIsLoadedContent(false)
    } 
  }
  

  const getTypeContentIcon = (type: string) => {
    switch (type) {
      case 'image': return (<GifIcon className="h-60 w-60 brand-color" title='Encrypted image content'> </GifIcon>)
      case 'video': return (<VideoCameraIcon className="h-60 w-60 brand-color" title='Encrypted video content'> </VideoCameraIcon>)
      case 'audio': return (<MusicalNoteIcon className="h-60 w-60 brand-color" title='Encrypted audio content'> </MusicalNoteIcon>)
      case 'application': return (<DocumentChartBarIcon className="h-60 w-60 brand-color" title='Encrypted application content'> </DocumentChartBarIcon>)
      case 'text': return (<DocumentTextIcon className="h-60 w-60 brand-color" title='Encrypted text content'> </DocumentTextIcon>)
      default: return (<DocumentTextIcon className="h-60 w-60 brand-color" title='Encrypted any content'> </DocumentTextIcon>)
    }
  }
  return (<>
    <div key={index} className="border shadow rounded-xl overflow-hidden">
      {/* {isLoadedContent ? <Loader /> : nft?.playbackId && !['0x'].includes(nft?.playbackId) && nft?.playbackId.length < 18 ?
       <div className='m-4 pl-1'>{getTemplateByTypeFile(nft?.image ?? "", handledDescription[0], nft.playbackId, nft.name)}</div> :
        <div className="pt-2 m-auto w-20 h-20">{getTemplateByTypeFile(base64Img, 'image')}</div>
      } */}
      {isLoadedContent ? <Loader /> : nft?.decodedImage ?  <div className='m-4 pl-1'>{getTemplateByTypeFile(nft?.decodedImage , handledDescription[0])}</div>
      : <div className="ml-20 mr-20">{getTypeContentIcon(handledDescription[0])}</div>}
      <div className="p-4">
      <p style={{ height: '20px' }} className="text-sm font-semibold text-gray-400">ID: {nft?.tokenId}</p>
        <p style={{ height: '20px' }} className="text-sm font-semibold text-gray-400">NAME: {nft?.name}</p>
      </div>
      <div id="accordion-collapse" data-accordion="collapse">
        <h2 id="accordion-collapse-heading-1">
          <button type="button" className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setExpanded(!expanded)} data-accordion-target="#accordion-collapse-body-1" aria-expanded="true" aria-controls="accordion-collapse-body-1">
            <span>{expanded ? 'Description of the NFT' : 'Click to see the description'}</span>
            <svg data-accordion-icon className="w-6 h-6 rotate-180 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
        </h2>
        <div id="accordion-collapse-body-1" className={!expanded ? "hidden" : ""} aria-labelledby="accordion-collapse-heading-1">
          <div className="p-5 font-light border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
            <p className="mb-2 text-xl font-bold text-white"> {handledDescription[1]}</p>
          </div>
        </div>
        <h2 id="accordion-collapse-heading-2">
          <button type="button" className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setExpandedPrompt(!expandedPrompt)} data-accordion-target="#accordion-collapse-body-2" aria-expanded="true" aria-controls="accordion-collapse-body-2">
            <span>{expandedPrompt ? 'Prompt for the image' : 'Click to see the prompt for the image'}</span>
            <svg data-accordion-icon className="w-6 h-6 rotate-180 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
        </h2>
        <div id="accordion-collapse-body-2" className={!expandedPrompt? "hidden" : ""} aria-labelledby="accordion-collapse-heading-2">
          <div className="p-5 font-light border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
            <p className="mb-2 text-xl font-bold text-white"> {nft?.decodedPrompt ? nft?.decodedPrompt : 'The prompt has encoded' }</p>
          </div>
        </div>
        <div className="p-4">
          <p style={{ height: '10px' }} className="text-sm font-semibold text-gray-400" >Owner: {userAddress === nft?.owner ? 'You': nft?.owner}</p>
        </div>
        {/* {userAddress !== nft?.owner && <div className="p-4 flex" onClick={()=>chatSeller(nft?.owner ?? '')}>
        <ChatBubbleBottomCenterTextIcon className="h-6 w-6 brand-color" title={`Chat with ${nft?.owner}`} />
          <p style={{ height: '10px' }} className="pl-3 text-sm font-semibold text-gray-400  hover-chat" >Chat with the seller</p>
          
        </div>} */}
      </div>
      <div className="p-4 bg-slate-400">
        <p className={`text-xl font-bold ${nft?.buyers && nft?.buyers?.length > 0 ? "text-orange-500" :"text-white"}`}>Seller's price:  {nft?.price} ETH</p>
        <p className={`text-xl font-bold ${nft?.buyers && nft?.buyers?.length > 0 ? "text-orange-500" :"text-white"}`}>Max bet: {nft?.maxPrice} ETH</p>
        <p className={`text-xl font-bold ${nft?.buyers && nft?.buyers?.length > 0 ? "text-orange-500" :"text-white"}`}>Buyers: {nft?.buyers?.length} </p>
        <p className={`text-xl font-bold ${nft?.buyers && nft?.buyers?.length > 0 ? "text-orange-500" :"text-white"}`}>Total sum of bets: {nft?.totalSum} ETH</p>
        <div className="m-auto  w-full brand-btn text-white font-bold py-2 px-6 rounded">
          <Link href={`/nft-market/${nft?.tokenId}`} className="px-6  brand-color text-white text-xl font-bold rounded">
            Go to auction board
          </Link>
        </div>
        {isLoadedContent ? <Loader /> :
        nft?.image?.split(',')[0].split(";")[1] !== 'base64' && userAddress === nft?.seller && !nft?.decodedPrompt &&
          <button className="mt-4  w-full brand-btn text-white text-xl font-bold py-2   rounded" onClick={() => decryptData(nft)}>Decrypt the PROMPT</button>}
      </div>
    </div>
  </>);
}

export default NftCard;
