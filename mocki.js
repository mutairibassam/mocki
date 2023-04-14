const { AutocannonConfig } = require('./AutocannonConfig');
const generateData2 = require('./MockarooConfig').generateData2
const flattenJson = require("./converter").flattenJson
const startBench = require("./bench").startBench
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/benchmark', async (req, res) => {
  const request = req.body;
  let result = {}

  const config = AutocannonConfig.getInstance({
    protocol: request.protocol,
    baseUrl: request['base-url'],
    port: request.port,
    path: request.path,
    numConnections: request['connection-count'],
    maxConnectionRequests: request['connection-count'],
    duration: request.duration,
    method: request.method,
    headers: request.headers,
    payload: JSON.parse(request.payload)
  })

  if(config.method !== "GET") {
    const flatJson = flattenJson(config.payload);
    const [isValid, msg] = await generateData2(flatJson);
    if(isValid) {
      const result = await startBench()
      return res.send({data: result})
    } else {
      console.log(msg);
      return res.send({data: msg})
    }
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});