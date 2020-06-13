import fetch from 'node-fetch'
import { Provider, Result } from './'
import cheerio from 'cheerio'

export default class EgyNewTechProvider implements Provider {
    public name = 'EgyNewTech'
    public logo =
        'https://www.egynewtech.com/image/cache/catalog/Website%20Logo/400%20X%20126_logo%20EgyNewTech-with%20website_30-01-2019-400x126.png'
    public url =
        'https://www.egynewtech.com/nintendo-switch-neon-red-neon-blue-hac-001-01-nintendo-en-gb'

    async check(): Promise<Result> {
        const res = await fetch(this.url)
        const content = await res.text()
        const $ = cheerio.load(content)

        return {
            inStock: !$('.product-stock').hasClass('out-of-stock'),
            price: `${Number(
                $('meta[property="product:price:amount"]')
                    .prop('content')
                    .replace(',', '')
            )} EGP`,
        }
    }
}
