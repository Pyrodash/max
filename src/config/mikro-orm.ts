import Config from './'
import { Options, ReflectMetadataProvider } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'

const options: Options<PostgreSqlDriver> = {
    metadataProvider: ReflectMetadataProvider,
    entities: [],
    dbName: Config.dbName,
    type: 'postgresql',
}

export default options
