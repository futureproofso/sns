import { Account, AccountExternal } from "./account"

export type LutRecord = {
    to: string
    from: string
    data: {
        plaintext: string
        ciphertext: string
    }
}

export function createLutRecord(
    account: Account,
    ae: AccountExternal,
    ciphertext: string
): LutRecord {
    const plaintext = this.account.decrypt(ciphertext)
    return {
        to: account.getAddress(),
        from: ae.getAddress(),
        data: {
            plaintext,
            ciphertext
        }
    }
}

export function createLutRecordExternal(
    account: Account,
    ae: AccountExternal,
    plaintext: string
): LutRecord {
    const ciphertext = ae.selfEncrypt(plaintext)
    return {
        to: ae.getAddress(),
        from: account.getAddress(),
        data: {
            plaintext,
            ciphertext
        }
    }
}
