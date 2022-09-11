import * as assert from 'assert'
import { bech32 } from 'bech32'
import { hash as b3hash } from 'blake3'
import { Key, KeyChain, ProtectedKeyChainOptions, PublicKeyChainOptions } from './keychain'

export interface IAccount {
    address: string
    isExternal(): boolean
    getAddress(version?: number): string
    getPublicEncryptionKey(): string
    getPublicSigningKey(): Key
}

abstract class AAccount implements IAccount {
    protected keychain: KeyChain
    address: string

    constructor(options: PublicKeyChainOptions | ProtectedKeyChainOptions) {
        this.keychain = new KeyChain(options)
        this.address = this.getAddress()
    }

    abstract isExternal(): boolean

    getAddress(version: number = 0x0): string {
        return constructAddress(this.keychain.getPublicSigningKey().material, version)
    }

    getPublicEncryptionKey(): string {
        return this.keychain.getPublicEncryptionKey()
    }

    getPublicSigningKey(): Key {
        return this.keychain.getPublicSigningKey()
    }
}

export class Account extends AAccount {
    constructor(privateEncryptionKey?: string, privateSigningKeyMnemonic?: string) {
        const options: ProtectedKeyChainOptions = {
            privateEncryptionKey,
            privateSigningKeyMnemonic
        }
        super(options)
    }

    isExternal(): boolean {
        return false
    }

    decrypt(ciphertext: string): string {
        return this.keychain.decrypt(ciphertext)
    }

    sign(message: string): string {
        return this.keychain.sign(message)
    }
}

export class AccountExternal extends AAccount {
    constructor(publicEncryptionKey: string, publicSigningKey: string) {
        const options: PublicKeyChainOptions = {
            publicEncryptionKey,
            publicSigningKey
        }
        super(options)
    }

    isExternal(): boolean {
        return true
    }

    selfEncrypt(plaintext: string): string {
        return this.keychain.encrypt(plaintext)
    }

    selfVerify(message: string, signature: string): boolean {
        return this.keychain.verify(message, signature)
    }
}

export function constructAddress(key: Buffer, version: number = 0x0) {
    const ver = Buffer.from([version])
    const dig = b3hash(key.toString('hex')).slice(1)
    const buf = Buffer.concat([ver, dig as Buffer])
    assert(buf.byteLength == 32, `Invalid buffer byte length: ${buf.byteLength}`)
    return bech32.encode('pub', bech32.toWords(buf))
}
