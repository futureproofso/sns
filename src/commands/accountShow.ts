import { inject, injectable } from 'tsyringe'
import { Config, readKeyChainFromFile } from '../config.js'
import { Command } from './index.js'
import { Account } from '../account.js'
import { logger } from '../logger.js'

@injectable()
export class AccountShow implements Command {
    constructor(@inject('config') private config: Config) {
        this.config = config
    }

    async execute(): Promise<void> {
        const keychain = await readKeyChainFromFile(this.config.path)
        const account = new Account(keychain.getPrivateEncryptionKey(), keychain.getPrivateSigningKey().toString())
        logger.scope('account').scope('show').log(account.address)
        logger.ghost('account').ghost('show').encryptionKey(JSON.stringify(account.getPublicEncryptionKey()))
        logger.ghost('account').ghost('show').signingKey(JSON.stringify(account.getPublicSigningKey().toString()))
    }
}
