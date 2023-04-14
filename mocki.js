const { AutocannonConfig } = require('./AutocannonConfig');
const { ApiMetrics } = require("./ApiMetrics");
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
  const config = new AutocannonConfig({
    protocol: request.protocol,
    baseUrl: request['base-url'],
    port: request.port,
    path: request.path,
    numConnections: request['connection-count'],
    maxConnectionRequests: request['requester-count'],
    duration: request.duration,
    method: request.method,
    headers: request.headers,
    payload: request.payload.length > 0 ? JSON.parse(request.payload) : {}
  })
  if(config.method !== "GET") {
    const flatJson = flattenJson(config.payload);
    const [isValid, msg] = await generateData2(flatJson);
    if(!isValid) {
      return res.send({data: msg})
    }
  }
  const result = await startBench()
  const obj = new ApiMetrics(result)
  return res.send({data: obj}) 
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});