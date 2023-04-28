const fs = require("fs");
const { AutocannonConfig } = require('./AutocannonConfig');
const { ApiMetrics } = require("./ApiMetrics");
const { MockarooKey } = require("./MockarooKey");
const generateData2 = require('./MockarooConfig').generateData2
const converter = require("./converter")
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
    path: request.path,
    port: request.port,
    numConnections: request['connection-count'],
    maxConnectionRequests: request['requester-count'],
    duration: request.duration,
    method: request.method,
    headers: request.headers,
    payload: request.payload.length > 0 ? JSON.parse(request.payload) : {}
  })

  const filename_dummy = "./dummy.json";
  const filename_params = "./dummy_params.json";
  await fs.promises.writeFile(filename_dummy, "");
  await fs.promises.writeFile(filename_params, "");

  if(config.method !== "GET") {
    const flatJson = converter.flattenJson(config.payload);
    const [isValid, msg] = await generateData2(flatJson);
    if(!isValid) {
      return res.send({data: msg})
    }
  }
  const instance = AutocannonConfig.getInstance();
  console.log(instance.params.length);
  if(instance.params.length > 0) {
    const flatParams = converter.flattenParams(config.params);
    const [isValid, msg] = await generateData2(flatParams, "query");
    if(!isValid) {
      return res.send({data: msg})
    } 
  }
  const result = await startBench()
  console.log(result);
  // removeFiles()

  const obj = new ApiMetrics(result)
  return res.send({data: obj}) 
});

/// delete local files
function removeFiles() {
  try {
    fs.unlink("dummy.json", (err) => {
      if (err) throw err;
      console.log(`File dummy was deleted`);
    });
    fs.unlink("dummy_params.json", (err) => {
      if (err) throw err;
      console.log(`File dummy_params was deleted`);
    }); 
  } catch (error) {
    console.log(error);
  }
}

app.get("/token", async (req, res) => {
  const token = req.query.apiKey
  console.log(token);
  if(token === "") {
    return res.status(401).send({result: "Empty? seriously!"}) 
  }
  new MockarooKey({token})
  return res.status(200).send({result: "Token has been set."})
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});