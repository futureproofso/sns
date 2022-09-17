import inquirer from 'inquirer'
import * as fs from 'fs'
import { container, inject, injectable } from 'tsyringe';
import { VERSION } from '../cli.js'
import { Config, writeKeyChainToFile } from '../config.js'
import { FileSystemDb } from '../db.js'
import { SingletonFactory } from '../registry.js'
import { KeyChain } from '../keychain.js'
import { Command } from './index.js'

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

@injectable()
export class Init implements Command {
    constructor(@inject('config') private config: Config) {
        this.config = config
    }

    async execute(): Promise<void> {
        console.log('Initializing SNS...')
        initQuestions.path.default = this.config.path
        inquirer.prompt(Object.values(initQuestions)).then(async ({ path, createAccount }) => {
            await fs.promises.mkdir(this.config.path, { recursive: true })
            await fs.promises.writeFile(`${this.config.path}/VERSION`, VERSION, { encoding: 'utf8' })
            const dbFactory = container.resolve<SingletonFactory>('DatabaseFactory')
            dbFactory.create<FileSystemDb>({ path })
            if (createAccount) {
                const keychain = new KeyChain({})
                await writeKeyChainToFile(path, keychain)
            }
            console.log('Application is initialized.')
        })
    }
}
