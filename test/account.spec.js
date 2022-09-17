import 'mocha'
import { expect } from 'chai'
import { Account, AccountExternal } from '../out/account.js'
import { isBase64 } from '../out/utils.js'
import { bech32 } from 'bech32'
import { KeyChain } from '../out/keychain.js'

const PRIVATE_KEY = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAVwAAAAdzc2gtcn
NhAAAAAwEAAQAAAEEAhPtzL3hfDwDAh+Rg6KfwHUbjuUeQFMMuWTH2SuJ6ifevEh5blR3b
U7yMlNTgrS54F9vEFSef2eYR9u+8P3KfiQAAARgAAAAAAAAAAAAAAAdzc2gtcnNhAAAAQQ
CE+3MveF8PAMCH5GDop/AdRuO5R5AUwy5ZMfZK4nqJ968SHluVHdtTvIyU1OCtLngX28QV
J5/Z5hH277w/cp+JAAAAAwEAAQAAAEBM3W7Z3HDNojinE6m0MQYIViZgvO2aIqtSoR9kb3
426l1un0+SE14mJJ5GrHLooajpzBNS1ZSyfX3kZXgHk0yRAAAAIQDFS3TN9KVFfcg1FAjm
cA4TnMWnh6I+UGiX2zrNhdDIvgAAACEA0go5zVF+F25dt2PlGAe7gsvHMEck+uGBqTIoLI
qgrM0AAAAhAKIUsbbE3xDhNYZnhCNpmmMxWkBnoI/YIo6BkZiGdT2tAAAAAAEC
-----END OPENSSH PRIVATE KEY-----
`

describe('constructor', () => {
    it('when empty, should generate a random keypair', () => {
        const alex = new Account()
        const beth = new Account()
        expect(alex['keychain'].getPrivateEncryptionKey()).to.not.equal(beth['keychain'].getPrivateEncryptionKey())
    })
    it('should import a private key', () => {
        const alex = new Account(PRIVATE_KEY)
        expect(alex['keychain'].getPrivateEncryptionKey()).to.equal(PRIVATE_KEY)
    })
})

describe('getPublicKey', () => {
    it('should return public key in openssh format', () => {
        const alex = new Account()
        expect(alex.getPublicEncryptionKey().startsWith('ssh-rsa')).to.be.true
        expect(alex.getPublicEncryptionKey().startsWith('ssh-rsa')).to.be.true
        const beth = new Account()
        expect(beth.getPublicEncryptionKey().startsWith('ssh-rsa')).to.be.true
        const cait = new Account(PRIVATE_KEY)
        expect(cait.getPublicEncryptionKey().startsWith('ssh-rsa')).to.be.true
    })
})

describe('getPrivateKey', () => {
    it('should return private key in openssh format', () => {
        const alex = new Account()
        expect(alex['keychain'].getPrivateEncryptionKey().startsWith('-----BEGIN OPENSSH PRIVATE KEY-----')).to.be.true
        expect(alex['keychain'].getPrivateEncryptionKey().startsWith('-----BEGIN OPENSSH PRIVATE KEY-----')).to.be.true
        const beth = new Account()
        expect(beth['keychain'].getPrivateEncryptionKey().startsWith('-----BEGIN OPENSSH PRIVATE KEY-----')).to.be.true
        const cait = new Account(PRIVATE_KEY)
        expect(cait['keychain'].getPrivateEncryptionKey().startsWith('-----BEGIN OPENSSH PRIVATE KEY-----')).to.be.true
    })
})

describe('encrypt', () => {
    let accounts = [new Account(), new Account(PRIVATE_KEY)]
    accounts.forEach((acct, index) => {
        it(`${index + 1}: should return base64 format`, () => {
            const beth = new AccountExternal(acct.getPublicEncryptionKey(), acct.getPublicSigningKey().toString())
            const plaintext = 'I will be encrypted'
            const encrypted = beth.selfEncrypt(plaintext)
            expect(encrypted).to.not.equal(plaintext)
            expect(isBase64(encrypted)).to.be.true
        })
    })
    accounts = [new Account(), new Account(PRIVATE_KEY)]
    accounts.forEach((acct, index) => {
        it(`${index + 1}: should encrypt for public key and decrypt with corresponding private key`, () => {
            const alex = new Account()
            const plaintext = 'this is a secret message'
            const encrypted = KeyChain.encrypt(acct.getPublicEncryptionKey(), plaintext)
            const decrypted = acct.decrypt(encrypted)
            expect(decrypted).to.equal(plaintext)
        })
    })
})

describe('decrypt', () => {
    let accounts = [new Account(), new Account(PRIVATE_KEY)]
    accounts.forEach((acct, index) => {
    it(`${index + 1}: should decrypt with beths private key (encrypted via keychain)`, () => {
        const plaintext = 'hello, world. this is super secret'
        const ae = new AccountExternal(acct.getPublicEncryptionKey(), acct.getPublicSigningKey().toString())
        const encrypted = ae.selfEncrypt(plaintext)
        const decrypted = acct.decrypt(encrypted)
        expect(decrypted).to.equal(plaintext)
    })
    })
    accounts.forEach((acct, index) => {
    it(`${index + 1}: should decrypt with beths private key (encrypted via alex)`, () => {
        const alex = new Account()
        const plaintext = 'hello, world. this is super secret'
        const encrypted = KeyChain.encrypt(acct.getPublicEncryptionKey().toString(), plaintext)
        const decrypted = acct.decrypt(encrypted)
        expect(decrypted).to.equal(plaintext)
    })
    })
})

describe('sign', () => {
    it('returns a base64 string representing a signature', () => {
        const alex = new Account()
        const signature = alex.sign('signing a message here')
        expect(isBase64(signature)).to.be.true
    })
})

describe('verify', () => {
    it('should return true when signed and verified with same keypair', () => {
        const alex = new Account()
        const message = 'this is it!'
        const signature = alex.sign(message)
        const acct = new Account()
        const beth = new AccountExternal(acct.getPublicEncryptionKey(), acct.getPublicSigningKey().toString())
        const signature2 = acct.sign(message)
        expect(KeyChain.verify(message, signature, alex.getPublicSigningKey().material)).to.be.true
        expect(KeyChain.verify(message, signature2, alex.getPublicSigningKey().material)).to.be.false
        expect(beth.selfVerify(message, signature)).to.be.false
        expect(beth.selfVerify(message, signature2)).to.be.true
    })
})

describe('address', () => {
    it('should be bech32', () => {
        const alex = new Account()
        const alexAddress = alex.getAddress()
        expect(alexAddress.startsWith('pub1')).to.be.true
        expect(bech32.decode(alexAddress)).to.not.throw
        const acct = new Account()
        const beth = new AccountExternal(acct.getPublicEncryptionKey(), acct.getPublicSigningKey().toString())
        const bethAddress = beth.getAddress()
        expect(bethAddress.startsWith('pub1')).to.be.true
        expect(bech32.decode(bethAddress)).to.not.throw
    })
    it('should be 62 characters', () => {
        const beth = new Account()
        const bethAddress = beth.getAddress()
        expect(bethAddress.length).to.equal(62)
        const acct = new Account()
        const cait = new AccountExternal(acct.getPublicEncryptionKey(), acct.getPublicSigningKey().toString())
        const caitAddress = cait.getAddress()
        expect(caitAddress.length).to.equal(62)
    })
    it('should be deterministic', () => {
        const acct = new Account()
        const dane = new AccountExternal(acct.getPublicEncryptionKey(), acct.getPublicSigningKey().toString())
        expect(dane.getAddress()).to.equal(acct.getAddress())
    })
})

describe.only('show account external', () => {
    it('logs to console', () => {
        const acct = new Account()
        console.log('publicEncryptionKey', acct.getPublicEncryptionKey())
        console.log('publicSigningKey', acct.getPublicSigningKey().toString())
    })
})
