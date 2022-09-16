import { container, DependencyContainer } from 'tsyringe';
import { defaultConfig } from './config.js'
import { Database, FileSystemDb } from './db.js'

container.register('defaultConfig', { useValue: defaultConfig })
container.register('DatabaseFactory', {
    useFactory: c => new SingletonFactory(c, 'db', FileSystemDb)
})

export class SingletonFactory {
    constructor(private container: DependencyContainer, private token: string, private cls: any) {
        this.container = container
        this.token = token
        this.cls = cls
    }

    create<T>(...args): T {
        const instance = new this.cls(...args)
        this.container.register(this.token, { useValue: instance })
        return instance
    }
}
