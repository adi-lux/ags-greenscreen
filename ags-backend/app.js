import express from 'express'
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {PutCommand, DynamoDBDocumentClient, ScanCommand, QueryCommand} from "@aws-sdk/lib-dynamodb"
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
    const command = new QueryCommand({
        TableName: "SensorMetrics",
        Limit: 1,
        Select: "ALL_ATTRIBUTES",
        ConsistentRead: true,
        ScanIndexForward: true,
    })

    const {Items} = await docClient.send(command)
    console.log(Items);

    let temp;
    let hum;
    let aq;
    // Is only length 1 so should work
    for (const i of Items) {
        temp = i.Temperature;
        hum = i.Humidity;
        aq = i.AirQuality;
    }

    res.send({
        temperature: temp,
        humidity: hum,
        air_quality: aq
    })
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
