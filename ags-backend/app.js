import express from 'express'
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand, DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb"
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

app.get('/', (req,res) => {
    const command = new ScanCommand({
        TableName: "SensorMetrics",
        Select: "ALL_ATTRIBUTES",
        ConsistentRead: true
    })

    let items;
    docClient.send(command).then((res) => {
        items = res.Items
    })
    let totalTemp = 0;
    let totalHum = 0;
    let totalAQ = 0;
    let total = 0

    for (const i of items) {
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
