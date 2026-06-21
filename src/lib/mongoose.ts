import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'debt-tracker'

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable')
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var _mongoose: MongooseCache | undefined
}

// Cache the connection across hot reloads in development and across
// serverless invocations to avoid creating a new connection on every request.
const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null }
global._mongoose = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      dbName,
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
