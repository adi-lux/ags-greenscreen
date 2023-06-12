import express from 'express'
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand, DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb"
const app = express()
const port = 3000
const dbClient = new DynamoDBClient({region: 'us-west-2'})
const docClient = DynamoDBDocumentClient.from(dbClient)

app.use(express.json());

app.post('/', (req, res) => {

    const {body} = req
    console.log(body)
    const params = {
        TableName: 'SensorMetrics',
        Item: {
            'Timestamp': (new Date()).getTime().toString(),
            'Temperature': req.body.temp.toString(),
            'Humidity': req.body.hum.toString(),
            'AirQuality': req.body.aq.toString(),
        }
    }

    const updateCommand = new PutCommand(params)
    docClient.send(updateCommand)
             .then((res) => console.log(res))

    res.send(`Logged temperature: ${req.body.temp}, humidity: ${req.body.hum}, air quality: ${req.body.aq}`)

})

app.get('/', (req,res) => {

})

app.listen(port, () => {
    console.log(`Example listening on port ${port}`)
})
