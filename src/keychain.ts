import * as crypto from 'crypto'
import ed25519 from 'ed25519'
import { base64, entropyToMnemonic } from 'ethers/lib/utils.js'
import NodeRSA from 'node-rsa'

export class Key {
    material: Buffer
    static fromString(key: string) {
        return new Key(Buffer.from(base64.decode(key)))
    }
    constructor(material: Buffer) {
        this.material = material
    }
    /**
     * Returns base64 encoded string of buffer
     * @returns
     */
    toString(): string {
        return this.material.toString('base64')
    }
}

export type PublicKeyChainOptions = {
    publicEncryptionKey: string
    publicSigningKey: string
}

export type ProtectedKeyChainOptions = {
    privateEncryptionKey?: string
    privateSigningKeyMnemonic?: string
}

export type NodeED25519 = {
    publicKey: Key,
    privateKey: Key
}

export class KeyChain {
    readonly publicOnly: boolean
    private signingKeys: NodeED25519
    private encryptionKeys: typeof NodeRSA
    readonly mnemonic: string

    /**
     * Encrypts plaintext for public key
     * @param publicEncryptionKey openssh RSA public key
     * @param plaintext
     * @returns base64 encoded ciphertext
     */
    static encrypt(publicEncryptionKey: string, plaintext: string): string {
        const encryptionKeys = NodeRSA()
        encryptionKeys.importKey(publicEncryptionKey, 'openssh-public')
        return encryptionKeys.encrypt(plaintext, 'base64')
    }

    /**
     * Verifies the signature over the message
     * @param message 
     * @param signature base64 encoded
     * @param publicSigningKey Buffer
     * @returns True if the key signed the message
     */
    static verify(message: string, signature: string, publicSigningKey: Buffer): boolean {
        return ed25519.Verify(
            Buffer.from(message, 'utf8'),
            Buffer.from(signature, 'base64'),
            publicSigningKey
        )
    }

    constructor(options: PublicKeyChainOptions | ProtectedKeyChainOptions) {
        if ((options as PublicKeyChainOptions).publicEncryptionKey) {
            this.publicOnly = true
            this.encryptionKeys = importPublicEncryptionKey(<PublicKeyChainOptions>options)
            this.signingKeys = importPublicSigningKey(<PublicKeyChainOptions>options)
            return
        }

        this.publicOnly = false
        if ((options as ProtectedKeyChainOptions).privateEncryptionKey) {
            this.encryptionKeys = importPrivateEncryptionKey(<ProtectedKeyChainOptions>options)
        } else {
            this.encryptionKeys = NodeRSA().generateKeyPair(512)
        }
        if ((options as ProtectedKeyChainOptions).privateSigningKeyMnemonic) {
            this.mnemonic = (options as ProtectedKeyChainOptions).privateSigningKeyMnemonic
            this.signingKeys = generateSigningKeys(this.mnemonic)
        } else {
            this.mnemonic = generateMnemonic()
            this.signingKeys = generateSigningKeys(this.mnemonic)
        }
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
     * @returns Key object containing ED25519 public key
     */
    getPublicSigningKey(): Key {
        return this.signingKeys.publicKey
    }

    /**
     * Returns private key used for signing
     * @returns Key object containing ED25519 private key
     */
    getPrivateSigningKey(): Key {
        if (this.publicOnly) return null
        return this.signingKeys.privateKey
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
        return ed25519.Sign(Buffer.from(message, 'utf8'), this.signingKeys.privateKey.material).toString('base64')
    }

    encrypt(plaintext: string): string {
        return KeyChain.encrypt(this.encryptionKeys.exportKey('openssh-public-pem'), plaintext)
    }

    verify(message: string, signature: string): boolean {
        return KeyChain.verify(message, signature, this.signingKeys.publicKey.material)
    }
}

function generateMnemonic(): string {
    return entropyToMnemonic(crypto.randomBytes(32))
}

function generateSigningKeys(mnemonic: string): NodeED25519  {
    const seed = crypto.createHash('sha256').update(
        mnemonic
    ).digest()
    const keypair = ed25519.MakeKeypair(seed)
    return {
        publicKey: new Key(keypair.publicKey),
        privateKey: new Key(keypair.privateKey)
    }
}

function importPublicEncryptionKey(options: PublicKeyChainOptions): typeof NodeRSA {
    const encryptionKeys = NodeRSA()
    return encryptionKeys.importKey(
        (options as PublicKeyChainOptions).publicEncryptionKey,
        'openssh-public-pem'
    )
}

function importPrivateEncryptionKey(options: ProtectedKeyChainOptions): typeof NodeRSA {
    const encryptionKeys = NodeRSA()
    return encryptionKeys.importKey(
        options.privateEncryptionKey,
        'openssh-private-pem'
    )
}

function importPublicSigningKey(options: PublicKeyChainOptions) {
    return {
        publicKey: Key.fromString(options.publicSigningKey),
        privateKey: null
    }
}
