import { SecretName } from '../secretName.js'
import { Account, AccountExternal } from '../account.js'
import { inject, injectable } from 'tsyringe';
import { Database } from '../db.js'
import { Config, readKeyChainFromFile } from '../config.js'
import { logger } from '../logger.js';
import { Command } from './index.js'

@injectable()
export class ContactShow implements Command {
    constructor(@inject('config') private config: Config, @inject('db') private db: Database) {
        this.config = config
        this.db = db
    }

    async execute(id: { address?: string, alias?: string }): Promise<void> {
        if (!id.address) {
            id.address = await this.db.readContactAlias(id.alias)
        }
        const contact = await this.db.readContact(id.address)
        logger.scope('contact').scope('list').address(contact.address)
        contact.alias && logger.ghost('contact').ghost('list').alias(contact.alias)
    }
}
