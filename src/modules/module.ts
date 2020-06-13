import Max from '~/max'
import { Client } from 'discord.js'
import { EventEmitter } from 'events'

export default class Module extends EventEmitter {
    public static __instance: Module
    public static __config: unknown

    public max: Max
    public client: Client

    public config: any

    constructor(max: Max) {
        super()

        this.max = max
        this.client = this.max.client
        this.config = (this.constructor as typeof Module).__config

        this.registerEvents()
    }

    static get(): Module {
        return this.__instance
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    registerEvents(): void {}
}
