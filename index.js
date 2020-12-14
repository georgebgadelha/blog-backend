const express = require('express')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 8080
const versionPrefix = '/api/v1'
const usersRouter = require('./src/routes/users')
const postsRouter = require('./src/routes/posts')

const db = require('./src/lib/db')

const app = express()

app.use(bodyParser.urlencoded({extended:false})) 
app.use(bodyParser.json())

app.use(`${versionPrefix}/users`, usersRouter)
app.use(`${versionPrefix}/posts`, postsRouter)



app.listen(PORT, function() {
  console.log(`Blog backend is running on port ${PORT}`)
})