import {
    ApplicationCommandOptionType,
    CommandInteraction,
    PermissionFlagsBits,
    Snowflake,
} from 'discord.js'
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    StreamType,
} from '@discordjs/voice'
import { Slash, CommandGroup, Option } from '~/commands'
import Module from '../module'
import { Client } from '../../../../Reddit/talks/src/client'
import { PassThrough } from 'stream'

@CommandGroup({ prefix: 'reddit' })
export default class RedditTalks extends Module {
    private streams: Map<Snowflake, PassThrough> = new Map()

    @Slash({
        name: 'join',
        description: 'Joins a Reddit Talks room',
        permissions: PermissionFlagsBits.Administrator,
    })
    @Option({
        name: 'id',
        description: 'Room ID of Reddit Talks room',
        required: true,
        type: ApplicationCommandOptionType.String,
    })
    async joinRedditTalk(interaction: CommandInteraction) {
        const member = interaction.guild.members.cache.get(interaction.user.id)

        if (!member.voice.channelId) {
            interaction.reply('You are not in a voice channel.')

            return
        }

        const { channel } = member.voice

        await interaction.deferReply()

        const roomId = interaction.options.get('id').value as string
        const client = new Client({
            deviceId: this.getEnv('REDDIT_TALKS_DEVICE_ID'),
            headers: {
                'x-reddit-loid': this.getEnv('REDDIT_TALKS_LOID'),
            },
            roomId,
        })

        await client.connect()

        client.stream.format('ogg')
        client.stream.addOption('-c:a', 'libopus')

        const guildId = interaction.guildId

        const stream = new PassThrough()

        client.stream.pipe(stream)
        client.stream.on('end', () => {
            console.log('ended')
        })

        this.streams.set(guildId, stream)

        const player = createAudioPlayer()
        const resource = createAudioResource(stream, {
            inputType: StreamType.OggOpus,
        })

        player.play(resource)

        const conn = joinVoiceChannel({
            channelId: channel.id,
            guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        })

        conn.subscribe(player)

        await interaction.editReply('Playing Reddit Talk')
    }
}
