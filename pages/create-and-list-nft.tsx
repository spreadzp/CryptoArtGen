'use client';

import { useEffect, useState } from 'react' 
import { useRouter } from 'next/router'
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { decryptByCJ, encryptByCJ, encryptData, getNewAccount } from '../utils/cypher'
import { env } from './../next.config'
import { getTemplateByTypeFile } from '../utils/common'
import Loader from './loader'
import { getWeb3Instance } from '../utils/web3';
import { Web3InstanceProps } from '../interfaces/types';

type AiData = {
  value: string,
  label: string
}

const auth =
  'Basic ' + Buffer.from(env.NEXT_PUBLIC_IPFS_KEY + ':' + env.NEXT_PUBLIC_IPFS_SECRET).toString('base64');

const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export default function CreateItem() {
  const [marketPlaceContract, setMarketPlaceContract] = useState(null || {} as any)
  const [encodedNftContract, setEncodedNftContract] = useState(null || {} as any)
  const [account, setAccount] = useState('')
  const [isUploadToIpfs, setIsUploadToIpfs] = useState(false)
  const [newPrivateKey, setNewPrivateKey] = useState('')
  const [enableMint, setEnableMint] = useState(false)
  const [base64FileData, setBase64FileData] = useState('')
  const [encryptedPrompt, setEncryptedPrompt] = useState('');
  const [encPrKByOwnerAddress, setEncPrKByOwnerAddress] = useState('');
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '', prompt: '', file: '' })
  const router = useRouter()
  const [isProcessMint, setIsProcessMint] = useState(false)
  const [isPromptEncoded, setIsPromptEncoded] = useState(false)
  const [typeFile, setTypeFile] = useState('')
  const [web3Utils, setWeb3Utils] = useState({} as any)

  useEffect(() => {
    generateKeys()
  }, [])

  useEffect(() => {
    getWeb3Instance()
      .then((inst: Web3InstanceProps) => {
        setAccount(inst.currentAddress)
        setMarketPlaceContract(inst.marketPlaceContract)
        setEncodedNftContract(inst.encNftContract)
        setWeb3Utils(inst.web3Utils)
      }).catch((err: any) => {
        console.log('err', err)
      })
  }, [])

  useEffect(() => {
    if (encryptedPrompt !== '' && newPrivateKey !== '') {
      const encryptPrivateKeyForNFTFile = async () => {
        const encData = await encryptData(account, newPrivateKey)
        if (encData !== '') {
          setEncPrKByOwnerAddress(encData)
        }
      }
      encryptPrivateKeyForNFTFile()

    }
  }, [newPrivateKey, encryptedPrompt]);



  const generateKeys = () => {
    const newIdentity = getNewAccount();
    setNewPrivateKey(newIdentity.privateKey);
  }

  async function onChangeFI(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (fileList) {
      const file = fileList[0];
      createImage(file);
    }
  }

  const encodePrompt = async () => {
    if (formInput.prompt !== '' && newPrivateKey !== '') {
      const encData = encryptByCJ(formInput.prompt, newPrivateKey)
      const decryptData = decryptByCJ(encData, newPrivateKey)
      if (encData !== '') {
        setEncryptedPrompt(encData);
        setIsPromptEncoded(true);
      }
    }
  }

  const defineTypeFile = (base64Code: string) => {
    return base64Code.split(';')[0].split('/')[0].split(":")[1];
  }

  const createImage = async (file: any) => {
    const reader = new FileReader()
    // eslint-disable-next-line
    reader.onload = async (e: any) => {
      const res = await reader.result?.toString()
      if (res) {
        setBase64FileData(res)
        setTypeFile(defineTypeFile(res))
      }
    }
    reader.readAsDataURL(file)
  }



  useEffect(() => {
    const { name, description, price } = formInput
    if (name && description && +price > 0 && encryptedPrompt && encPrKByOwnerAddress) {
      setEnableMint(true)

    } else {
      setEnableMint(false)
    }
  }, [formInput, encryptedPrompt, encPrKByOwnerAddress]);

  async function uploadToIPFS() {
    console.log('encryptedPrompt :>>', encryptedPrompt)
    const { name, description, price } = formInput
    if (!name || !description || !price || !encryptedPrompt || !base64FileData) {
      return
    } else {

      try {
        const uploadedFile = await client.add(base64FileData)
        if (uploadedFile) {
          const uploadedImage = `https://caravan.infura-ipfs.io/ipfs/${uploadedFile.path}`;
          const data = JSON.stringify({
            // typeFile = 'image' hardcoded
            name, description: `${'image'};${description}`, prompt: encryptedPrompt, image: uploadedImage
          })
          const added = await client.add(data)
          const url = `https://caravan.infura-ipfs.io/ipfs/${added.path}`
          console.log("🚀 ~ file: create-and-list-nft.tsx ~ line 158 ~ uploadToIPFS ~ url", url)
          return url
        }

      } catch (error) {
        console.log('Error uploading file: ', error)
      } finally {
        setBase64FileData("")
        setIsUploadToIpfs(false)
      }
    }
  }

  async function listNFTForSale() {
    try {
      // const web3Modal = new Web3Modal()
      // const provider = await web3Modal.connect()
      // const web3 = new Web3(provider)
      setIsUploadToIpfs(true)
      const url = await uploadToIPFS()

      setIsProcessMint(true)
      // const networkId = await web3.eth.net.getId()
      // Mint the NFT
      // const encodedNftContractAddress = ENCNFT.networks[`${networkId}` as keyof typeof ENCNFT.networks].address
      // const encodedNftContract = new web3.eth.Contract(ENCNFT.abi as any, encodedNftContractAddress)
      // const accounts = await web3.eth.getAccounts()
      // const marketPlaceContract = new web3.eth.Contract(Marketplace.abi as any, Marketplace.networks[`${networkId}` as keyof typeof Marketplace.networks].address)
      let listingFee = await marketPlaceContract.methods.getListingFee().call()
      listingFee = listingFee.toString()
      encodedNftContract.methods.mint(url, encPrKByOwnerAddress).send({
        from: account
      }).on('receipt', function (receipt: any) {
        // List the NFT
        const tokenId = receipt.events.NFTMinted.returnValues[0];
        console.log("🚀 ~ file: create-and-list-nft.tsx ~ line 199 ~ encodedNftContract.methods.mint ~ tokenId", tokenId)
        if (tokenId) {
          console.log('encodedNftContract.address', encodedNftContract._address)
          marketPlaceContract.methods.moveTokenForSell(tokenId, "Listing announce", web3Utils?.toWei(formInput.price, "ether"), encodedNftContract._address)//Web3.utils.toWei(formInput.price, "ether"))
            .send({ from: account, value: listingFee }).on('receipt', function (res: any) {
              console.log("🚀 ~ file: create-and-list-nft.tsx:194 ~ res:", res)
              console.log('listed')
              setIsProcessMint(false)
              router.push('/')
            });
        }
      }).on('error', (err: any) => {
        console.log("🚀 ~ file: create-and-list-nft.tsx ~ line 200 ~ encodedNftContract.methods.mint ~ err", err)
        setIsProcessMint(false)
      });
    } catch (err) {
      console.log('err :>>', err)
    }
  }


  return (
    <div className="flex items-start justify-center main-h brand-bg mint-nft">
      <div className="flex flex-col  create-form border-rose-500 p-5 w-100">
        <label htmlFor="name-nft" className='text-xl font-bold text-white' >Name </label>
        <input
          name="name-nft"
          placeholder="Asset Name"
          className="mb-5 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />

        {formInput.name !== '' && <div className="flex flex-col">
          <label htmlFor="description" className='text-xl font-bold text-white' >Description </label>
          <textarea
            placeholder="Asset Description" name="description"
            className="mb-5 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
          />
        </div>}

        {formInput.name !== '' && formInput.description !== '' && <div className="flex flex-col">
          <label htmlFor="description" className='text-xl font-bold text-white' >Prompt of the image </label>
          {formInput.prompt && !isPromptEncoded && <button onClick={encodePrompt} className="font-bold mint-btn rounded mt-10 p-4 shadow-lg mb-2" >
            Encode the prompt
          </button>}

          <textarea
            placeholder="Paste the prompt here" name="prompt"
            className="mb-5 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, prompt: e.target.value })}
          />
        </div>}

        {formInput.description !== '' && !base64FileData && isPromptEncoded && <div className="flex flex-col">
          <label htmlFor="image" className="block text-gray-700 font-bold mb-2">
            Image
          </label>
          <input
            type="file"
            name="image"
            onChange={onChangeFI}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>}

        {isPromptEncoded && <div className="flex flex-col">
          <label htmlFor="price" className='text-xl font-bold text-white' >Price </label>
          <input
            name="price"
            type="number"
            placeholder="Asset Price in Eth"
            className="mb-5 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
          />
        </div>}
        {
          base64FileData !== '' && <div className="poster">
            <div className="block mb-2 text-sm font-medium text-white dark:text-white">The image</div>
            {getTemplateByTypeFile(base64FileData, typeFile)}
          </div>
        }

        {isUploadToIpfs && enableMint &&
          <Loader />

        }
        {base64FileData !== '' && !isUploadToIpfs && enableMint && !isProcessMint && <button onClick={listNFTForSale} className="font-bold mint-btn rounded mt-10 p-4 shadow-lg">
          Mint and list NFT
        </button>}
        {isProcessMint && enableMint && <button type="button" className="font-bold mint-btn text-white rounded mt-10 p-4 shadow-lg" disabled>{isUploadToIpfs ? 'Uploading the info to IPFS' : 'Processing in Metamask...'}</button>}

      </div>
    </div>
  )
}

