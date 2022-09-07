import * as crypto from 'crypto'
import { Wallet } from 'ethers'

/*
Code reading
https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/addresses.spec.ts
*/

// Asymmetric key generation

const wallet1 = Wallet.createRandom()
console.log('wallet1', wallet1.address)
console.log('wallet1', wallet1.privateKey)
console.log('wallet1', wallet1.publicKey)
console.log('wallet1', wallet1.mnemonic)

const mnemonic = 'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol'
const wallet2 = Wallet.fromMnemonic(mnemonic)
console.log('wallet2', wallet2.address)
console.log('wallet2', wallet2.privateKey)
console.log('wallet2', wallet2.publicKey)
console.log('wallet2', wallet2.mnemonic)

const privateKey = crypto.randomBytes(32)
const wallet3 = new Wallet(privateKey)
console.log('wallet3', wallet3.address)
console.log('wallet3', wallet3.privateKey)
console.log('wallet3', wallet3.publicKey)
console.log('wallet3', wallet3.mnemonic)
