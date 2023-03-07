import EthCrypto from 'eth-crypto';
import CryptoJS from 'crypto-js';
import { metamaskEncrypt, getPublicKeyViaMetamask } from './metamask';

export async function getAccount() {
    return await window.ethereum.selectedAddress
}

export function encryptByCJ(message: string, secretKey: string) {
    const ciphertext = CryptoJS.AES.encrypt(message, secretKey).toString();
    console.log("🚀 ~ file: cypher.ts:11 ~ encryptByCJ ~ ciphertext:", ciphertext)
    return ciphertext
}

export function decryptByCJ(ciphertext: string, secretKey: string) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    console.log("🚀 ~ file: cypher.ts:18 ~ decryptByCJ ~ plaintext:", plaintext);
    return plaintext;
}

export function getNewAccount() {
    return EthCrypto.createIdentity();
}


export async function encryptData(address: string, data: string) {
    const pk = await getPublicKeyViaMetamask(address)
    return await metamaskEncrypt(data, pk)
}

export async function decrypt(cMessage: string) {
    const cyperObj = EthCrypto.cipher.parse(cMessage);
    return await EthCrypto.decryptWithPrivateKey(
        'bdb335a3c6dceda42eb92e6479f326d68d86bdf5237c41ff1eedf961813d2eb4', // privateKey
        cyperObj // encrypted-data
    );
}