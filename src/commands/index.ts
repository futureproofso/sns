export { ContactAdd } from './contactAdd.js'
export { Init } from './init.js'
export { NameReserve } from './nameReserve.js'

export interface Command {
    execute: (...args) => Promise<any>
}
