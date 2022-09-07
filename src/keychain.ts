import * as crypto from 'crypto'
import * as ed25519 from 'ed25519'
import { entropyToMnemonic } from 'ethers/lib/utils'
import * as NodeRSA from 'node-rsa'

export type PublicKeyChainOptions = {
    publicEncryptionKey: string
    publicSigningKey: string
}

export type ProtectedKeyChainOptions = {
    privateEncryptionKey?: string
    mnemonic?: string
}

export class KeyChain {
    readonly publicOnly: boolean
    private signingKeys: { publicKey: Buffer, privateKey: Buffer }
    private encryptionKeys: any
    readonly mnemonic: string

    /**
     * Encrypts plaintext for public key
     * @param publicEncryptionKey openssh RSA public key
     * @param plaintext
     * @returns base64 encoded ciphertext
     */
    static encrypt(publicEncryptionKey: string, plaintext: string): string {
        const encryptionKeys = new NodeRSA()
        encryptionKeys.importKey(publicEncryptionKey, 'openssh-public')
        return encryptionKeys.encrypt(plaintext, 'base64')
    }

    /**
     * Verifies the signature over the message
     * @param message 
     * @param signature base64 encoded
     * @param publicSigningKey base64 encoded
     * @returns True if the key signed the message
     */
    static verify(message: string, signature: string, publicSigningKey: string): boolean {
        return ed25519.Verify(
            Buffer.from(message, 'utf8'),
            Buffer.from(signature, 'base64'),
            Buffer.from(publicSigningKey, 'base64')
        )
    }

    constructor(options: PublicKeyChainOptions | ProtectedKeyChainOptions) {
        if (options as PublicKeyChainOptions) {
            return
        }
        const encryptionKeys = new NodeRSA()
        if ((options as ProtectedKeyChainOptions).privateEncryptionKey) {
            encryptionKeys.importKey(
                (options as ProtectedKeyChainOptions).privateEncryptionKey,
                'openssh-private-pem'
            )
        } else {
            encryptionKeys.generateKeyPair(512)
        }
        if (!(options as ProtectedKeyChainOptions).mnemonic) {
            (options as ProtectedKeyChainOptions).mnemonic = entropyToMnemonic(
                crypto.randomBytes(32)
            )
        }
        const seed = crypto.createHash('sha256').update(
            (options as ProtectedKeyChainOptions).mnemonic
        ).digest()
        const signingKeys = ed25519.MakeKeypair(seed)
        this.encryptionKeys = encryptionKeys
        this.signingKeys = signingKeys
        this.mnemonic = (options as ProtectedKeyChainOptions).mnemonic
    }

    /**
     * Returns public key used for encryption
     * @returns openssh pem formatted RSA key
     */
    getPublicEncryptionKey(): string {
        return this.encryptionKeys.exportKey('openssh-public-pem')
    }

    /**
     * Returns private key used for decryption
     * @returns openssh pem formatted RSA key
     */
    getPrivateEncryptionKey(): string {
        if (this.publicOnly) return null
        return this.encryptionKeys.exportKey('openssh-private-pem')
    }

    /**
     * Returns public key used for signature verification
     * @returns base64 encoded ED25519 public key
     */
    getPublicSigningKey(opts: { asBuffer: boolean } = { asBuffer: false }): Buffer | string {
        if (opts.asBuffer) {
            return this.signingKeys.publicKey
        }
        return this.signingKeys.publicKey.toString('base64')
    }

    /**
     * Returns private key used for signing
     * @returns base64 encoded ED25519 private key
     */
    getPrivateSigningKey(opts: { asBuffer: boolean } = { asBuffer: false }): Buffer | string {
        if (this.publicOnly) return null
        if (opts.asBuffer) {
            return this.signingKeys.privateKey
        }
        return this.signingKeys.privateKey.toString('base64')
    }

    decrypt(ciphertext: string): string {
        if (this.publicOnly) return null
        return this.encryptionKeys.decrypt(ciphertext, 'utf8')
    }

    /**
     * Returns message signed by this account's private signing key
     * @param message Message to sign
     * @returns base64 encoded signature
     */
    sign(message: string): string {
        if (this.publicOnly) return null
        return ed25519.Sign(Buffer.from(message, 'utf8'), this.signingKeys.privateKey).toString('base64')
    }

    encrypt(plaintext: string): string {
        return KeyChain.encrypt(this.getPublicEncryptionKey(), plaintext)
    }

    verify(message: string, signature: string): boolean {
        return KeyChain.verify(message, signature, this.getPublicSigningKey() as string)
    }
}
