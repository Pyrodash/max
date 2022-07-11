import Max from '~/max'
import { Client } from 'discord.js'
import { EventEmitter } from 'events'

export default class Module extends EventEmitter {
    public max: Max
    public client: Client

    private registerEvents?(): void

    constructor(max: Max) {
        super()

        this.max = max
        this.client = this.max.client

        if (this.registerEvents) {
            this.registerEvents()
        }
    }
}
