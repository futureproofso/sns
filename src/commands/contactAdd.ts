import { SecretName } from '../secretName.js'
import { Account, AccountExternal } from '../account.js'
import { inject, injectable } from 'tsyringe';
import { Database } from '../db.js'
import { Config, readKeyChainFromFile } from '../config.js'
import { Command } from './index.js'
import { Contact } from '../contact.js';

@injectable()
export class ContactAdd implements Command {
    constructor(@inject('config') private config: Config, @inject('db') private db: Database) {
        this.config = config
        this.db = db
    }

    async execute(publicEncryptionKey: string, publicSigningKey: string, alias?: string): Promise<void> {
        console.log('Creating contact...')
        const account = new AccountExternal(publicEncryptionKey, publicSigningKey)
        const contact: Contact = {
            address: account.address,
            alias,
            publicEncryptionKey,
            publicSigningKey
        }
        const contactData = await this.db.readContact(contact.address)
        if (contactData) {
            console.log(`Replacing contact for address ${account.address}...`)
        }
        await this.db.writeContact(contact)
        console.log(`Contact added for address ${account.address}`)
    }
}
