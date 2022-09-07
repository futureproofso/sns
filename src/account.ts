import * as assert from 'assert'
import { bech32 } from 'bech32'
import { hash as b3hash } from 'blake3'
import { KeyChain } from './keychain'

export interface IAccount {
    address: string
    isExternal(): boolean
    getAddress(version?: number): string
    getPublicEncryptionKey(): string
    getPublicSigningKey(): string
}

abstract class AAccount implements IAccount {
    protected keychain: KeyChain
    address: string

    abstract isExternal(): boolean

    getAddress(version: number = 0x0): string {
        return constructAddress(this.keychain.getPublicSigningKey() as Buffer, version)
    }

    getPublicEncryptionKey(): string {
        return this.keychain.getPublicEncryptionKey()
    }

    getPublicSigningKey(): string {
        return this.keychain.getPublicSigningKey() as string
    }
}

export class Account extends AAccount {
    constructor(privateEncryptionKey?: string, mnemonic?: string) {
        super()
        this.keychain = new KeyChain({privateEncryptionKey, mnemonic})
        this.address = this.getAddress()
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
        super()
        this.keychain = new KeyChain({publicEncryptionKey, publicSigningKey})
        this.address = this.getAddress()
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
