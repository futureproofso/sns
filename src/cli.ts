import 'reflect-metadata'
import './registry.js'
import { program } from 'commander'
import { container } from 'tsyringe'
import * as commands from './commands/index.js'
import { Config } from './config.js'
import { FileSystemDb } from './db.js'
import { SingletonFactory } from './registry.js'

export const VERSION = '0.0.1'

const defaultConfig = container.resolve<Config>('defaultConfig')

program
    .version(VERSION, '-v, -V, --version', 'output the version number')
    .optsWithGlobals()

program
    .command('init')
    .option('-p, --path <string>', 'path to store initialization files', defaultConfig.path)
    .action(async (options) => {
        const config = defaultConfig
        config.path = options.path
        container.register('config', { useValue: config })
        const command = container.resolve(commands.Init)
        command.execute()
    })

program
    .command('account')
    .command('show')
    .description('Show public account details')
    .option('-p, --path <string>', 'path to sns account')
    .action(async ({ path }) => {
        const config = defaultConfig
        config.path = path
        container.register('config', { useValue: config })
        const command = container.resolve(commands.AccountShow)
        command.execute()
    })

program
    .command('name')
    .command('reserve')
    .description('Reserve a name if it is available')
    .argument('<string>', 'name to reserve')
    .option('-p, --path <string>', 'path to sns account', defaultConfig.path)
    .action(async (name, { path }) => {
        const config = defaultConfig
        config.path = path
        container.register('config', { useValue: config })
        const dbFactory = container.resolve<SingletonFactory>('DatabaseFactory')
        dbFactory.create<FileSystemDb>({ path })
        const command = container.resolve(commands.NameReserve)
        command.execute(name)
    })

const contact = program.command('contact')
contact
    .command('add')
    .description('Add to contact list')
    .argument('<string>', 'public encryption key')
    .argument('<string>', 'public signing key')
    .option('-a, --alias <string>', 'alias to help you remember the contact')
    .option('-p, --path <string>', 'path to sns account', defaultConfig.path)
    .action(async (publicEncryptionKey, publicSigningKey, { alias, path }) => {
        const config = defaultConfig
        config.path = path
        container.register('config', { useValue: config })
        const dbFactory = container.resolve<SingletonFactory>('DatabaseFactory')
        dbFactory.create<FileSystemDb>({ path })
        const command = container.resolve(commands.ContactAdd)
        command.execute(publicEncryptionKey, publicSigningKey, alias)
    })
contact
    .command('show')
    .description('Show contact')
    .argument('[string]', 'address')
    .option('-a, --alias <string>', 'alias of the contact')
    .option('-p, --path <string>', 'path to sns account', defaultConfig.path)
    .action(async (address, { alias, path }) => {
        const config = defaultConfig
        config.path = path
        container.register('config', { useValue: config })
        const dbFactory = container.resolve<SingletonFactory>('DatabaseFactory')
        dbFactory.create<FileSystemDb>({ path })
        const command = container.resolve(commands.ContactShow)
        command.execute({ address, alias })
    })
contact
    .command('list')
    .description('List all contacts')
    .option('-p, --path <string>', 'path to sns account', defaultConfig.path)
    .action(async ({ path }) => {
        const config = defaultConfig
        config.path = path
        container.register('config', { useValue: config })
        const dbFactory = container.resolve<SingletonFactory>('DatabaseFactory')
        dbFactory.create<FileSystemDb>({ path })
        const command = container.resolve(commands.ContactList)
        command.execute()
    })

program.parse();
