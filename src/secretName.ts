import { LutRecord } from "./lut.js"
import { Account, AccountExternal, IAccount } from "./account.js"

export interface ISecretName {
    readonly name: string
    controller: IAccount
    secrets: Record<string, LutRecord>
    isExternal(): boolean
    setController(account: IAccount): void
    putSecret(record: LutRecord): void
    deleteSecret(to: string): void
    clearSecrets(): void
}

abstract class ASecretName implements ISecretName {
    readonly name: string
    controller: Account | AccountExternal
    secrets: Record<string, LutRecord>

    constructor(name: string) {
        this.name = name
        this.secrets = {}
    }

    abstract isExternal(): boolean
    abstract setController(account: IAccount): void

    serialize() {
        return {
            name: this.name,
            controller: this.controller.address,
            secrets: Object.values(this.secrets)
        }
    }

    putSecret(record: LutRecord) {
        if (!this.controller) {
            throw Error('Missing required controller')
        }
        if (this.controller.getAddress() != record.from) {
            throw Error('Record must be from controller')
        }
        this.secrets[record.to] = record
    }

    deleteSecret(to: string): void {
        delete this.secrets[to]
    }

    clearSecrets() {
        this.secrets = {}
    }
}

export class SecretName extends ASecretName {
    declare controller: Account

    constructor(name: string) {
        super(name)
    }

    isExternal(): boolean {
        return false
    }

    setController(account: IAccount) {
        if (!(account instanceof Account)) {
            throw Error('Invalid account')
        }
        this.controller = account as Account
    }
}

export class SecretNameExternal extends ASecretName {
    declare controller: AccountExternal

    constructor(name: string) {
        super(name)
    }

    isExternal(): boolean {
        return true
    }

    setController(account: IAccount) {
        if (!(account instanceof AccountExternal)) {
            throw Error('Invalid account')
        }
        this.controller = account
    }
}
