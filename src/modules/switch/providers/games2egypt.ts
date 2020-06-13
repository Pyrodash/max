import fetch from 'node-fetch'
import { Provider, Result } from './'
import cheerio from 'cheerio'

export default class Games2EgyptProvider implements Provider {
    public name = 'Games2Egypt'
    public logo = 'https://www.games2egypt.com/Images/Regions/1/1?t=371'
    public url =
        'https://www.games2egypt.com/Product/23081/nintendo-switch-neon-red-neon-blue-v-2'

    async check(): Promise<Result> {
        const res = await fetch(this.url)
        const content = await res.text()
        const $ = cheerio.load(content)

        return {
            inStock:
                $('meta[itemprop="availability"]').prop('content') !==
                'https://schema.org/OutOfStock',
            price: `${Number($('meta[itemprop="price"]').prop('content'))} EGP`,
        }
    }
}
