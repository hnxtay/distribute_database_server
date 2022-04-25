const express = require('express');
const createServer = require('./routes/server')
const app = express();
const port = 3000
const cors = require('cors')

app.use(express.json())
app.use(cors())

app.use('/server', createServer('SERVER'))
app.use('/tram1', createServer('TRAM1'))
app.use('/tram2', createServer('TRAM2'))

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}/`)
})

module.exports = app;