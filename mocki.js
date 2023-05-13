const fs = require("fs");
const { AutocannonConfig } = require("./AutocannonConfig");
const { ApiMetrics } = require("./ApiMetrics");
const { MockarooKey } = require("./MockarooKey");
const generateData2 = require("./MockarooConfig").generateData2;
const converter = require("./converter");
const startBench = require("./bench").startBench;
const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config();

/**
 *  load config file
 */
const config = require("./config/default.json");

/**
 *  for logging [https://www.npmjs.com/package/winston]
 */
require("./logger").intialize();
const logger = require("./logger").logger;

/**
 *  setting various HTTP headers [https://helmetjs.github.io/]
 */
const helmet = require("helmet");
const { log } = require("winston");

// Initialzie Express
const app = express();

// expose /temp/uploads directory to be accessed through link
app.use("/temp/uploads", express.static("temp/uploads"));

// Response Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

// parse application/octets-stream
/* binary files can accept upto 5mb */
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "1mb" }));

// parse application/json
app.use(bodyParser.json({ limit: "500mb", extended: true }));

app.use(helmet());

// For CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.post("/benchmark", async (req, res) => {
  try {
    const request = req.body;
    const config = new AutocannonConfig({
      protocol: request.protocol,
      baseUrl: request["base-url"],
      path: request.path,
      port: request.port,
      numConnections: request["connection-count"],
      maxConnectionRequests: request["requester-count"],
      duration: request.duration,
      method: request.method,
      headers: request.headers,
      payload: request.payload.length > 0 ? JSON.parse(request.payload) : {},
    });

    const filename_dummy = "./dummy.json";
    const filename_params = "./dummy_params.json";
    await fs.promises.writeFile(filename_dummy, "");
    await fs.promises.writeFile(filename_params, "");

    if (config.method !== "GET") {
      const flatJson = converter.flattenJson(config.payload);
      const [isValid, msg] = await generateData2(flatJson);
      if (!isValid) {
        return res.send({ data: msg });
      }
    }

    const instance = AutocannonConfig.getInstance();
    if (instance.dynamic_params.length > 0) {
      const flatParams = converter.flattenParams(config.dynamic_params);
      const [isValid, msg] = await generateData2(flatParams, "query");
      if (!isValid) {
        return res.send({ data: msg });
      }
    }
    const result = await startBench();
    removeFiles();
    const obj = new ApiMetrics(result);
    return res.status(200).send({ data: obj });
  } catch (error) {
    return res.status(400).send({ data: error });
  }
});

/// delete local files
function removeFiles() {
  try {
    fs.unlink("dummy.json", (err) => {
      if (err) throw err;
    });
    fs.unlink("dummy_params.json", (err) => {
      if (err) throw err;
    });
  } catch (error) {
    console.log(error);
  }
}

/**
 * Handles a GET request to the "/token" endpoint.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} The response object.
 */
app.get("/token", async (req, res) => {
  const token = req.query.apiKey;
  if (token === "") {
    return res.status(401).send({ result: "Empty? seriously!" });
  }
  new MockarooKey({ token });
  return res.status(200).send({ result: "Token has been set." });
});

const PORT = config.port || 3001;

app.listen(PORT, () => {
  logger.info(`Server @ ${config.base_url}:${PORT}`);
  new MockarooKey({ token: process.env.TOKEN });
  logger.info('Client has been instantiated successfully.')
  console.log(`\n[!] Mocki Backend is running locally. You can benchmark your localhost APIs.`)
  console.log(`[!] Issue/Features [https://github.com/mutairibassam/mocki-ui/issues]\n`);
});
