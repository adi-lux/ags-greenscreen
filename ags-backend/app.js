import express from 'express'
const app = express()
const router = express.Router();
const port = 3000


router.get('/', (req, res) => {

    console.log(req.query.temp)
    console.log(req.query.aq)
    console.log(req.query.hum)
    res.send(`Received temperature: ${req.query.temp}, humidity: ${req.query.hum}, air quality: ${req.query.aq}`)
})

app.use('/', router)
app.listen(port, () => {
    console.log(`Example listening on port ${port}`)
})
