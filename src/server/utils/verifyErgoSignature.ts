import { Address, verify_signature } from 'ergo-lib-wasm-nodejs';

export const verifySignature = (address: string, message: string, proof: string, type: string) => {
  const ergoAddress = Address.from_mainnet_str(address);
  // console.log('address: ' + ergoAddress)
  const convertedMessage = Buffer.from(message, 'utf-8')
  // console.log('message: ' + message)
  const convertedProof = type === 'nautilus'
    ? Buffer.from(proof, 'hex')
    : Buffer.from(proof, 'base64')
  // console.log('proof: ' + convertedProof)
  const result = verify_signature(ergoAddress, convertedMessage, convertedProof);
  return result
}