import { SecretName } from '../secretName.js'
import { Account, AccountExternal } from '../account.js'
import { inject, injectable } from 'tsyringe';
import { Database } from '../db.js'
import { Config, readKeyChainFromFile } from '../config.js'
import { Command } from './index.js'
import { Contact } from '../contact.js';
import { logger } from '../logger.js';

@injectable()
export class ContactList implements Command {
    constructor(@inject('config') private config: Config, @inject('db') private db: Database) {
        this.config = config
        this.db = db
    }

    async execute(): Promise<void> {
        const contacts = this.db.getAllContacts()
        let count = 0
        try {
            for await (const contact of contacts) {
                count++
                logger.scope('contact').scope('list').log(count)
                logger.ghost('contact').ghost('list').address(contact.address)
                contact.alias && logger.ghost('contact').ghost('list').alias(contact.alias)
            }
        } catch (err) {
            console.error(err)
        }
    }
}
