import { PermissionResolvable } from 'discord.js'
import { CommandHandler, CommandPayload } from './'

interface CommandOptions {
    name?: string
    parent?: string
    permissions?: PermissionResolvable[]
    handler?:
        | ((payload: CommandPayload) => void)
        | ((payload: CommandPayload) => Promise<void>)
}

export default function (options: CommandOptions = {}) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): void => {
        if (!options.name) options.name = propertyKey
        if (!options.parent) options.parent = ''
        if (!options.permissions) options.permissions = []
        if (!options.handler) options.handler = descriptor.value

        const space = options.parent ? ' ' : ''
        const cmdName = `${options.parent}${space}${options.name}`

        CommandHandler.get().on('command', (payload: CommandPayload) => {
            if (
                payload.content.startsWith(cmdName) &&
                (payload.content.length === cmdName.length ||
                    payload.content.charAt(cmdName.length) === ' ')
            ) {
                const { message } = payload
                const permissions = message.member.permissionsIn(
                    message.channel
                )

                for (const permission of options.permissions) {
                    if (!permissions.has(permission)) {
                        return message.channel.send(
                            `The \`${permission}\` permission is required to use this command.`
                        )
                    }
                }

                payload.command = options.name
                message.content = message.content.substr(cmdName.length).trim()

                if (target.constructor.__instance) {
                    options.handler = options.handler.bind(
                        target.constructor.__instance
                    )
                }

                options.handler(payload)
            }
        })
    }
}
