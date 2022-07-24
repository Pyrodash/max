import 'reflect-metadata'
import 'module-alias/register'

import dotenv from 'dotenv'

dotenv.config()

import pkg from '../package.json'
import Max from './max'

console.log(`max ${pkg.version} - ${pkg.description}\n`)

new Max()
