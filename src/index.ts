import Max from './max'
import dotenv from 'dotenv'
import 'module-alias/register'

dotenv.config()
console.log(
    `max ${process.env.npm_package_version} - ${process.env.npm_package_description}\n`
)

new Max()
