import Max from '../max'
import { Message } from 'discord.js'
import { EventEmitter } from 'events'

export class CommandPayload {
    public content: string
    public message: Message

    constructor(msg: Message) {
        this.message = msg
        this.content = msg.content = msg.content.substr(
            process.env.PREFIX.length
        )
    }
}

let instance: CommandHandler

export class CommandHandler extends EventEmitter {
    constructor() {
        super()

        this.registerEvents()
    }

    static get(): CommandHandler {
        return instance || (instance = new CommandHandler())
    }

    registerEvents(): void {
        Max.get().client.on('message', (msg: Message) => {
            if (msg.author.bot) return

            if (msg.content.startsWith(process.env.PREFIX)) {
                const payload = new CommandPayload(msg)

                this.handleCommand(payload)
            }
        })
    }

    handleCommand(payload: CommandPayload): void {
        this.emit('command', payload)
    }
}
