/* eslint-disable @typescript-eslint/no-explicit-any */

import { CommandInteraction } from 'discord.js'
import { CommandManager } from './manager'

type CommandHandler = (interaction: CommandInteraction) => void

export interface ICommand {
    name: string
    description: string
    handler: CommandHandler
}

export function CommandGroup<T extends { new (...args: any[]): object }>(
    constructor: T
) {
    const cls = class extends constructor {
        [Symbol.toStringTag] = constructor.name

        constructor(...args: any[]) {
            super(...args)
            
            const cmds = getCommands(this)
            const mgr = CommandManager.instance

            cmds.forEach((cmd) => {
                mgr.register({
                    ...cmd,
                    handler: cmd.handler.bind(this)
                })
            })
        }
    }

    Object.defineProperty(cls, 'name', {
        value: constructor.name
    })

    return cls
}

export interface CommandOptions {
    name?: string
    description: string
}

export function Command(options: CommandOptions) {
    return (
        target: unknown,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): void => {
        if (!options.name) options.name = propertyKey

        const commands: ICommand[] = Reflect.getOwnMetadata('commands', target) || []

        commands.push({
            name: options.name,
            description: options.description,
            handler: descriptor.value,
        })

        Reflect.defineMetadata('commands', commands, target)
    }
}

function getCommands(target: unknown): ICommand[] {
    return Reflect.getMetadata('commands', target)
}
