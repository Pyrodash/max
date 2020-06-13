import { Message } from 'discord.js'
import { CommandHandler, CommandPayload } from './'

interface CommandOptions {
    name?: string
    handler?: ((msg: Message) => void) | ((msg: Message) => Promise<void>)
}

export default function (options: CommandOptions = {}) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): void => {
        if (!options.name) options.name = propertyKey
        if (!options.handler) options.handler = descriptor.value

        const cmdName = options.name

        CommandHandler.get().on('command', (payload: CommandPayload) => {
            if (
                payload.content.startsWith(cmdName) &&
                (payload.content.length === cmdName.length ||
                    payload.content.charAt(cmdName.length) === ' ')
            ) {
                payload.message.content = payload.message.content.substr(
                    cmdName.length
                )

                if (target.constructor.__instance) {
                    options.handler = options.handler.bind(
                        target.constructor.__instance
                    )
                }

                options.handler(payload.message)
            }
        })
    }
}
