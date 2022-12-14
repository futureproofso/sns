export { AccountShow } from './accountShow.js'
export { ContactAdd } from './contactAdd.js'
export { ContactList } from './contactList.js'
export { ContactShow } from './contactShow.js'
export { Init } from './init.js'
export { NameReserve } from './nameReserve.js'

export interface Command {
    execute: (...args) => Promise<any>
}
