import { Level } from 'level'
import { Contact } from './contact.js'
import { SecretName } from './secretName.js'

export type FileSystemDbOptions = {
    path: string
}

export interface Database {
    client: any
    readContact: (contact: Contact | string) => Promise<any>
    writeContact: (contact: Contact) => Promise<any>
    writeSecretName: (sn: SecretName) => Promise<any>
}

export class FileSystemDb implements Database {
    client: Level<string, any>

    constructor(options: FileSystemDbOptions) {
        this.client = new Level(`${options.path}db/`, { valueEncoding: 'json' })
    }

    async readContact(contact: Contact | string): Promise<any> {
        let address: string
        if (typeof contact != 'string') {
            address = contact.address
        } else {
            address = contact
        }
        const key = `contact:${address}`
        return await this.getLastEntry(key)
    }

    async writeContact(contact: Contact): Promise<void> {
        const data = contact
        const key = `contact:${contact.address}`
        await this.addEntry(key, data)
    }

    async writeSecretName(sn: SecretName): Promise<void> {
        const data = sn.serialize()
        const key = `sn:${sn.name}`
        await this.addEntry(key, data)
    }

    private async addEntry(key: string, data: any): Promise<void> {
        let nextCount = 0
        let nextValue = { [nextCount]: data }
        try {
            const prevCount = await this.client.get(`${key}:_count`)
            nextCount = prevCount + 1
            const prevValue = await this.client.get(key)
            nextValue = { ...prevValue, [nextCount]: data }
        } catch (error) {
            // first entry
        }
        await this.client.put(`${key}:_count`, nextCount)
        await this.client.put(key, nextValue)
    }

    private async getLastEntry(key: string): Promise<any> {
        try {
            const count = await this.client.get(`${key}:_count`)
            const value = await this.client.get(key)
            return value[count]
        } catch (error) {
            return null
        }
    }
}
