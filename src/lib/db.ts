import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'debt-tracker'

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable')
}

// Reuse the MongoClient across hot reloads in development to avoid
// exhausting the connection pool.
let client: MongoClient

declare global {
  var _mongoClient: MongoClient | undefined
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri)
  }
  client = global._mongoClient
} else {
  client = new MongoClient(uri)
}

export { client }

export const db: Db = client.db(dbName)
