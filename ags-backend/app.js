import express from 'express'
import cors from 'cors'
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand, DynamoDBDocumentClient, ScanCommand, QueryCommand} from "@aws-sdk/lib-dynamodb"
const app = express()
const port = 3000
const dbClient = new DynamoDBClient({region: 'us-west-2'})
const docClient = DynamoDBDocumentClient.from(dbClient)

let globalRecent = {
    recent_temperature: 0,
    recent_humidity: 0,
    recent_air_quality: 0
}
app.use(express.json());
app.use(cors())
app.post('/', (req, res) => {

    globalRecent.recent_temperature = req.body.temp
    globalRecent.recent_humidity = req.body.hum
    globalRecent.recent_air_quality = req.body.aq

    const params = {
        TableName: 'SensorMetrics',
        Item: {
            'Timestamp': (new Date()).getTime(),
            'Temperature': req.body.temp,
            'Humidity': req.body.hum,
            'AirQuality': req.body.aq,
        }
    }

    const updateCommand = new PutCommand(params)
    docClient.send(updateCommand)
             .then((res) => console.log(res))

    res.send(`Logged temperature: ${req.body.temp}, humidity: ${req.body.hum}, air quality: ${req.body.aq}`)

})

app.get('/', async (req, res) => {
    res.send(globalRecent)
})

app.get('/avg', async (req,res) => {
    const command = new ScanCommand({
        TableName: "SensorMetrics",
        Select: "ALL_ATTRIBUTES",
        ConsistentRead: true
    })

    const {Items} = await docClient.send(command)

    console.log(Items);
    let totalTemp = 0;
    let totalHum = 0;
    let totalAQ = 0;
    let total = 0

    for (const i of Items) {
        totalTemp += i.Temperature;
        totalHum += i.Humidity;
        totalAQ += i.AirQuality;
        total += 1
    }
    const avg_temp = totalTemp / total;
    const avg_hum = totalHum / total;
    const avg_aq = totalAQ / total

    res.send({
        average_temperature: avg_temp,
        average_humidity: avg_hum,
        average_air_quality: avg_aq
    })
})

app.listen(port, () => {
    console.log(`Example listening on port ${port}`)
})
