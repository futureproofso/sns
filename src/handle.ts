import { LutRecord } from "./lut"
import { Account, AccountExternal, IAccount } from "./account"

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

export class SecretName implements ISecretName {
    readonly name: string
    controller: IAccount
    secrets: Record<string, LutRecord>

    constructor(name: string) {
        this.name = name
        this.secrets = {}
    }

    isExternal(): boolean {
        return false
    }

    setController(account: IAccount) {
        this.controller = (account as Account)
    }

    putSecret(record: LutRecord) {
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

export class SecretNameExternal extends SecretName {
    constructor(name: string) {
        super(name)
    }

    isExternal(): boolean {
        return true
    }

    setController(account: IAccount) {
        // TODO: should fail at compile time
        this.controller = (account as AccountExternal)
    }
}
