import { Level } from 'level'
import { SecretName } from './secretName.js'

export type FileSystemDbOptions = {
    path: string
}

export interface Database {
    client: any
    writeSecretName: (sn: SecretName) => Promise<any>
}

export class FileSystemDb implements Database {
    client: Level<string, any>

    constructor(options: FileSystemDbOptions) {
        this.client = new Level(`${options.path}db/`, { valueEncoding: 'json' })
    }

    async writeSecretName(sn: SecretName): Promise<void> {
        const data = sn.serialize()
        const key = `sn:${sn.name}`
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
}
