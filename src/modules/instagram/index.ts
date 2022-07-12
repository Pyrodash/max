import { CommandInteraction, Message } from 'discord.js'
import fetch from 'node-fetch'
import { Command, Slash, CommandGroup, Description, Name, Option } from '~/commands'
import Module from '../module'
import { IgApiData, IgMediaItem } from './types'

const igRegexp = /(https?:\/\/(?:www\.)?instagram\.com\/p\/([^/?#&]+)).*/g
const reqOptions = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    }
}

function isValidInstagramUrl(url: string): boolean {
    return igRegexp.test(url)
}

function getUrlFromMedia(media: IgMediaItem): string {
    if (media.video_url) {
        return media.video_url
    } else {
        return media.display_url
    }
}

@CommandGroup
export default class Instagram extends Module {
    @Slash()
    @Name('instagram')
    @Description('Fetches media from Instagram')
    @Option({ name: 'url', description: 'URL of the Instagram post', type: 'STRING', required: true })
    async get(interaction: CommandInteraction) {
        const inputUrl = interaction.options.getString('url')
        const url = inputUrl.split('?')[0] + '?__a=1&__d=1'

        if (isValidInstagramUrl(url)) {
            await interaction.deferReply({ ephemeral: true })
        } else {
            await interaction.reply({
                content: 'Fetching...',
                ephemeral: true
            })
        }

        const urls = []
        const data: IgApiData = await fetch(url, reqOptions)
            .then((res) => res.json()) as IgApiData

        const media = data.graphql.shortcode_media
        const items = media.edge_sidecar_to_children?.edges

        if (items) {
            for (const item of items) {
                urls.push(getUrlFromMedia(item.node))
            }
        } else {
            urls.push(getUrlFromMedia(media))
        }

        interaction.reply(urls.join('\n'))
    }

    @Command({ name: 'ping', description: 'replies with pong!' })
    pingCmd(msg: Message) {
        msg.reply('pong!')
    }
}
