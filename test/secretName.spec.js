import 'mocha'
import { expect } from 'chai'

import { Account, AccountExternal } from '../out/account.js'
import { SecretName as SN } from '../out/secretName.js'

const emptyLutRecord = {
    to: '',
    from: '',
    data: {
        plaintext: '',
        ciphertext: ''
    }
}


describe('SecretName', () => {
    it('starts with only a name', () => {
        const sn = new SN('stickykeys')
        expect(sn.name).to.equal('stickykeys')
        expect(sn.isExternal()).to.be.false
        expect(sn.secrets).to.deep.equal({})
        expect(() => sn.putSecret(emptyLutRecord)).to.throw()
    })
    describe('setController', () => {
        it('throws if passed an external account', () => {
            const acct = new Account()
            const alex = new AccountExternal(acct.getPublicEncryptionKey(), acct.getPublicSigningKey().toString())
            const sn = new SN('stickykeys')
            expect(() => sn.setController(alex)).to.throw()
        })
    })
})
