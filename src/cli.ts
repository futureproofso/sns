import { program } from 'commander'
import inquirer from 'inquirer'
import { Level } from 'level'
import * as fs from 'fs'
import * as os from 'os'
import { KeyChain } from './keychain.js'
import { SecretName } from './secretName.js'
import { Account } from './account.js'

const version = '0.0.1'
const homedir = os.homedir();
const defaultInitPath = `${homedir}/.sns/`

const initQuestions = {
    path: {
        type: 'input',
        name: 'path',
        message: 'Path to store initialization files:',
        default: undefined
    },
    createAccount: {
        type: 'confirm',
        name: 'createAccount',
        message: 'Create new account?'
    }
}

program
    .version(version, '-v, -V, --version', 'output the version number')
    .optsWithGlobals()

program
    .command('init')
    .option('-p, --path <string>', 'path to store initialization files', defaultInitPath)
    .action(async (options) => {
        console.log('Initializing SNS...')
        initQuestions.path.default = defaultInitPath
        inquirer.prompt(Object.values(initQuestions)).then(async ({ path, createAccount }) => {
            await fs.promises.mkdir(path, { recursive: true })
            await fs.promises.writeFile(`${path}/VERSION`, version, { encoding: 'utf8' })
            const db = new Level(`${path}db/`, { valueEncoding: 'json' })
            if (createAccount) {
                const keychain = new KeyChain({})
                await writeKeyChainToFile(path, keychain)
            }
            console.log('Application is initialized.')
        })
})

program
    .command('name')
    .command('reserve')
    .description('Reserve a name if it is available')
    .argument('<string>', 'name to reserve')
    .option('-p, --path <string>', 'path to sns account', defaultInitPath)
    .action(async (name, { path }) => {
        console.log('Checking availability of name...') // TODO: do this!
        const available = true
        if (available) {
            console.log(`Name (${name}) is available!`)
            const keychain = await readKeyChainFromFile(path)
            const account = Account.fromKeyChain(keychain)
            const sn = new SecretName(name)
            sn.setController(account)
            const db = new Level(`${path}db/`, { valueEncoding: 'json' })
            await writeSecretNameToDb(db, sn)
            console.log(`Name (${name}) reserved!`)
        }
    })

program.parse();

async function writeKeyChainToFile(path: string, keychain: KeyChain): Promise<void> {
    const encKeyRSA = keychain.getPrivateEncryptionKey()
    const secretPhrase = keychain.mnemonic
    const data = JSON.stringify({
        encKeyRSA,
        secretPhrase
    })
    await fs.promises.writeFile(`${path}/account.sns`, data, { encoding: 'utf8' })
}

async function readKeyChainFromFile(path: string): Promise<KeyChain> {
    const data = await fs.promises.readFile(`${path}/account.sns`, { encoding: 'utf-8' })
    const { encKeyRSA, secretPhrase } = JSON.parse(data)
    return new KeyChain({privateEncryptionKey: encKeyRSA, privateSigningKeyMnemonic: secretPhrase})
}

async function writeSecretNameToDb(db: any, sn: SecretName): Promise<void> {
    const data = sn.serialize()
    const key = `sn:${sn.name}`
    let nextCount = 0
    let nextValue = { [nextCount]: data }
    try {
        const prevCount = await db.get(`${key}:_count`)
        nextCount = prevCount + 1
        const prevValue = await db.get(key)
        nextValue = {...prevValue, [nextCount]: data }
    } catch (error) {
        // first entry
    }
    await db.put(`${key}:_count`, nextCount)
    await db.put(key, nextValue)
}
