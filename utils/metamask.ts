import { encrypt } from 'eth-sig-util'
import web3 from 'web3'
var EthCrypto = require('eth-crypto');
export async function getPublicKeyViaMetamask(address: string): Promise<string> {
    return new Promise((resolve, reject) => {
        window.ethereum.sendAsync(
            {
                jsonrpc: '2.0',
                method: 'eth_getEncryptionPublicKey',
                params: [address],
                // from: address,
            },
            function (error: any, encryptionpublickey: any) {
                if (!error) {
                    resolve(encryptionpublickey.result)
                } else {
                    reject(error)
                }
            }
        )
    })
}

export async function encryptByPublicKey(message: string, pubKey: string) {
    // console.log(message)
    const encrypted = await EthCrypto.encryptWithPublicKey(
        pubKey, // publicKey
        message // message
    ); 

    const encryptedMessage = EthCrypto.cipher.stringify(
        encrypted
    )
    console.log("🚀 ~ file: metamask.ts:34 ~ encryptByPublicKey ~ encryptedMessage", encryptedMessage)
    // const enc = await ethcrypto.encryptWithPublicKey(pubKey, message)
    // console.log("🚀 ~ file: metamask.js ~ line 36 ~ metamaskEncrypt ~ enc", enc)
    // const encryptedMessage = ethcrypto.cipher.stringify(enc);
    return encryptedMessage
}

export async function metamaskEncrypt(message: string, pubKey: any) {
    //console.log("🚀 ~ file: metamask.js ~ line 41 ~ metamaskEncrypt ~ pubKey", pubKey)
   // console.log(message)

    const enc = encrypt(
        pubKey,
        { data: message },
        'x25519-xsalsa20-poly1305'
    )
     console.log("🚀 ~ file: metamask.js ~ line 31 ~ metamaskEncrypt ~ enc", enc)
    const encryptedMessage = web3.utils.toHex(
        JSON.stringify(
            enc
        )
    )
    console.log("🚀 ~ file: metamask.js ~ line 54 ~ metamaskEncrypt ~ encryptedMessage", encryptedMessage)
    // const enc = await ethcrypto.encryptWithPublicKey(pubKey, message)
    // console.log("🚀 ~ file: metamask.js ~ line 36 ~ metamaskEncrypt ~ enc", enc)
    // const encryptedMessage = ethcrypto.cipher.stringify(enc);
    return encryptedMessage
}

var handle = (promise: any) => {
    return promise
        .then((data: any )=> ([data, undefined]))
        .catch((error: any) => Promise.resolve([undefined, error]));
}

export async function decryptPrivateKey(encryptedMessage: string, account: string) {
     console.log(`encryptedMessage: ${encryptedMessage}`)
     const hexEncPK = web3.utils.toHex(encryptedMessage)
     console.log("🚀 ~ file: metamask.ts:72 ~ decryptPrivateKey ~ hexEncPK", hexEncPK)
    const [decryptedMessage, decryptErr] = await handle(window.ethereum.request({
        method: 'eth_decrypt',
        params: [hexEncPK, account],
    }));

    if (decryptErr) { console.error('@@@@@@@@@@', decryptErr.message) }
    else {
          console.log(`decryptedMessage: ${decryptedMessage}`)
        return decryptedMessage
    }
}

export async function decryptUriFile(encryptedMessage: string, privateKey: string) {
    console.log("🚀 ~ file: metamask.ts:86 ~ decryptUriFile ~ privateKey:", privateKey)
    console.log("🚀 ~ file: metamask.js ~ line 83 ~ decryptUriFile ~ encryptedMessage", encryptedMessage)
    try{
        // console.log(`encryptedMessage.length: ${encryptedMessage.length}`)
        const parsedEncInfo = EthCrypto.cipher.parse(encryptedMessage)
        console.log("🚀 ~ file: metamask.ts:90 ~ decryptUriFile ~ parsedEncInfo:", parsedEncInfo)
        const message = await EthCrypto.decryptWithPrivateKey(
            privateKey, parsedEncInfo)
    //console.log("🚀 ~ file: metamask.js ~ line 85 ~ decryptMessage ~ message", message)
        return message;
    } catch(err) {
        console.log('err :>> ', err);
    }
    
}
