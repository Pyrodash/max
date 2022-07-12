import { CommandInteraction, Message } from 'discord.js'
import { Command, Slash, CommandGroup, Description, Name } from '~/commands'
import Module from '../module'

@CommandGroup
export default class Instagram extends Module {
    @Slash()
    @Name('ping')
    @Description('replies with pong!')
    ping(interaction: CommandInteraction) {
        interaction.reply('pong!')
    }

    @Command({ name: 'ping', description: 'replies with pong!' })
    pingCmd(msg: Message) {
        msg.reply('pong!')
    }
}
