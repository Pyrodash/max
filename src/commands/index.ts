/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    ApplicationCommandOptionData,
    CommandInteraction,
    Message,
    PermissionResolvable,
} from 'discord.js'
import { CommandManager } from './manager'

type CommandPayload = CommandInteraction | Message
type CommandHandler = (payload: CommandPayload) => void

export interface ICommand {
    name: string
    description: string
    isSlash: boolean
    options?: ApplicationCommandOptionData[]
    permissions: PermissionResolvable
    handler: CommandHandler
}

export interface ICommandGroup {
    prefix?: string
}

enum DecoratorType {
    Command,
    Slash,
    Name,
    Description,
    Option,
}

export interface CommandGroupOptions {
    prefix?: string
}

function createCommandGroup<T extends { new (...args: any[]): object }>(
    options: CommandGroupOptions,
    constructor: T
) {
    const cls = class extends constructor {
        [Symbol.toStringTag] = constructor.name

        constructor(...args: any[]) {
            super(...args)

            const cmds = getCommands(this)
            const mgr = CommandManager.instance

            cmds.forEach((cmd) => {
                const separator = cmd.isSlash ? '-' : ' '

                mgr.register({
                    ...cmd,
                    name: options.prefix
                        ? `${options.prefix}${separator}${cmd.name}`
                        : cmd.name,
                    handler: cmd.handler.bind(this),
                })
            })
        }
    }

    Object.defineProperty(cls, 'name', {
        value: constructor.name,
    })

    const cmdGroup: ICommandGroup = {
        prefix: options.prefix,
    }

    Reflect.defineMetadata('info', cmdGroup, cls)

    return cls
}

export function CommandGroup(options: CommandGroupOptions = {}) {
    return function <T extends { new (...args: any[]): object }>(
        constructor: T
    ) {
        return createCommandGroup(options, constructor)
    }
}

export interface CommandOptions {
    name?: string
    description?: string
    permissions?: PermissionResolvable
}

function applyCommandMeta(
    type: DecoratorType,
    value: unknown,
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const commands: Map<string, ICommand> =
        Reflect.getOwnMetadata('commands', target) || new Map()

    let command: ICommand = commands.get(propertyKey) || {
        name: propertyKey,
        description: '',
        isSlash: false,
        handler: descriptor.value,
        permissions: [],
    }

    switch (type) {
        case DecoratorType.Command:
        case DecoratorType.Slash:
            command.isSlash = type === DecoratorType.Slash

            if (typeof value === 'object') {
                command = { ...command, ...value }
            }
            break
        case DecoratorType.Name:
            command.name = <string>value
            break
        case DecoratorType.Description:
            command.description = <string>value
            break
        case DecoratorType.Option:
            if (!command.options) command.options = []

            command.options.push(<ApplicationCommandOptionData>value)
            break
    }

    commands.set(propertyKey, command as ICommand)

    Reflect.defineMetadata('commands', commands, target)
}

function commandMetaFactory(type: DecoratorType, value: unknown) {
    return (
        target: unknown,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): void => {
        applyCommandMeta(type, value, target, propertyKey, descriptor)
    }
}

export function Command(options: CommandOptions = {}) {
    return commandMetaFactory(DecoratorType.Command, options)
}

export function Slash(options: CommandOptions = {}) {
    return commandMetaFactory(DecoratorType.Slash, options)
}

export function Name(value: string) {
    return commandMetaFactory(DecoratorType.Name, value)
}

export function Description(value: string) {
    return commandMetaFactory(DecoratorType.Description, value)
}

export function Option(option: ApplicationCommandOptionData) {
    return commandMetaFactory(DecoratorType.Option, option)
}

function getCommands(target: unknown): Map<string, ICommand> {
    return Reflect.getMetadata('commands', target)
}

export function getCommandGroupMetadata(target: unknown): ICommandGroup {
    return Reflect.getMetadata('info', target)
}
