export { Init } from './init.js'
export { ReserveName } from './reserve-name.js'

export interface Command {
    name: string
    execute: (name: string) => Promise<any>
}

