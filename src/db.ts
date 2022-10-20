import { Level } from 'level'
import { Contact } from './contact.js'
import { SecretName } from './secretName.js'

export type FileSystemDbOptions = {
    path: string
}

export interface Database {
    client: any
    getAllContacts: () => AsyncGenerator<Contact>
    readContact: (address: string) => Promise<Contact>
    readContactAlias: (alias: string) => Promise<any>
    writeContact: (contact: Contact) => Promise<any>
    writeContactAlias: (contact: Contact) => Promise<any>
    writeSecretName: (sn: SecretName) => Promise<any>
}

export class FileSystemDb implements Database {
    client: Level<string, any>

    constructor(options: FileSystemDbOptions) {
        this.client = new Level(`${options.path}db/`, { valueEncoding: 'json' })
    }

    async * getAllContacts(): any {
        const db = this.client.sublevel<string, any>('contact', { valueEncoding: 'json' })
        const iterator = db.keys()
        let key = await iterator.next()
        while (key) {
            if (key.split(':').length < 2) {
                // skip count key
                yield await this.getLastEntry(key, 'contact')
            }
            key = await iterator.next()
        }
        return
    }

    async readContact(address: string): Promise<Contact> {
        return await this.getLastEntry(address, 'contact')
    }

    async readContactAlias(alias: string): Promise<any> {
        return await this.getLastEntry(alias, 'contact:alias')
    }

    async writeContact(contact: Contact): Promise<void> {
        await this.addEntry(contact.address, contact, 'contact')
    }

    async writeContactAlias(contact: Contact): Promise<void> {
        await this.addEntry(contact.alias, contact.address, 'contact:alias')
    }

    async writeSecretName(sn: SecretName): Promise<void> {
        const data = sn.serialize()
        await this.addEntry(sn.name, data, 'sn')
    }

    private async addEntry(key: string, data: any, sublevel?: string): Promise<void> {
        const db = sublevel ? this.client.sublevel<string, any>(sublevel, { valueEncoding: 'json' }) : this.client
        let nextCount = 0
        let nextValue = { [nextCount]: data }
        try {
            const prevCount = await db.get(`${key}:_count`)
            nextCount = prevCount + 1
            const prevValue = await db.get(key)
            nextValue = { ...prevValue, [nextCount]: data }
        } catch (error) {
            // first entry
        }
        await db.put(`${key}:_count`, nextCount)
        await db.put(key, nextValue)
    }

    private async getLastEntry(key: string, sublevel?: string): Promise<any> {
        const db = sublevel ? this.client.sublevel<string, any>(sublevel, { valueEncoding: 'json' }) : this.client
        try {
            const count = await db.get(`${key}:_count`)
            const value = await db.get(key)
            return value[count]
        } catch (error) {
            return null
        }
    }
}
