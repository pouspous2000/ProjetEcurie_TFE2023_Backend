import http from 'http'
import app from '@/app'
import { Dotenv } from '@/utils/Dotenv'

new Dotenv()

const port = process.env.SERVER_PORT
app.set('port', port)

const server = http.createServer(app)
server.listen(port)
