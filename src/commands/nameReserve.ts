import { SecretName } from '../secretName.js'
import { Account } from '../account.js'
import { inject, injectable } from 'tsyringe';
import { Database } from '../db.js'
import { Config, readKeyChainFromFile } from '../config.js'
import { Command } from './index.js'

@injectable()
export class NameReserve implements Command {
    constructor(@inject('config') private config: Config, @inject('db') private db: Database) {
        this.config = config
        this.db = db
    }

    async execute(name: string): Promise<void> {
        console.log('Checking availability of name...') // TODO: do this!
        const available = true
        if (available) {
            console.log(`Name (${name}) is available!`)
            const keychain = await readKeyChainFromFile(this.config.path) // TODO: load into memory once to reduce io
            const account = Account.fromKeyChain(keychain)
            const sn = new SecretName(name)
            sn.setController(account)
            await this.db.writeSecretName(sn)
            console.log(`Name (${name}) reserved!`)
        }
    }
}
