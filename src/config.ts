import * as fs from 'fs'
import * as os from 'os'
import { container } from 'tsyringe'
import { KeyChain } from './keychain.js'

const homedir = os.homedir();

export type Config = {
    path?: string
}

export const defaultConfig: Config = {
    path: `${homedir}/.sns/`
}

export async function writeKeyChainToFile(path: string, keychain: KeyChain): Promise<void> {
    const encKeyRSA = keychain.getPrivateEncryptionKey()
    const secretPhrase = keychain.mnemonic
    const data = JSON.stringify({
        encKeyRSA,
        secretPhrase
    })
    await fs.promises.writeFile(`${path}/account.sns`, data, { encoding: 'utf8' })
}

export async function readKeyChainFromFile(path: string): Promise<KeyChain> {
    const data = await fs.promises.readFile(`${path}/account.sns`, { encoding: 'utf-8' })
    const { encKeyRSA, secretPhrase } = JSON.parse(data)
    return new KeyChain({ privateEncryptionKey: encKeyRSA, privateSigningKeyMnemonic: secretPhrase })
}
