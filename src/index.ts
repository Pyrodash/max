import 'reflect-metadata'
import 'module-alias/register'

import pkg from '../package.json'

import Max from './max'
import dotenv from 'dotenv'

dotenv.config()
console.log(
    `max ${pkg.version} - ${pkg.description}\n`
)

new Max()
