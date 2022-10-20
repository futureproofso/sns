import signale from 'signale'

const loggerTypes = {
    address: {
        color: 'blue',
        label: 'address',
        logLevel: 'info'
    },
    alias: {
        color: 'blue',
        label: 'alias',
        logLevel: 'info'
    },
    encryptionKey: {
        badge: '🔑',
        color: 'yellow',
        label: 'public encryption key',
        logLevel: 'info'
    },
    signingKey: {
        badge: '🔑',
        color: 'yellow',
        label: 'public signing key',
        logLevel: 'info'
    }
}

export class Logger extends signale.Signale {
    scopes: Array<string>

    static generateGhostScope(name: string): string {
        return ''.padEnd(name.length, '.')
    }

    constructor(scopes?: Array<string>) {
        super({ types: loggerTypes, scope: scopes })
        this.scopes = scopes
    }

    scope(name: string): any {
        const scopes = []
        this.scopes && scopes.push(...this.scopes)
        scopes.push(name)
        return new Logger(scopes)
    }

    ghost(name: string): any {
        return this.scope(Logger.generateGhostScope(name))
    }
}

export const logger = new Logger()
