// public packages
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

// internal packages
const { AutocannonConfig } = require("./AutocannonConfig");
const { ApiMetrics } = require("./ApiMetrics");
const { MockarooKey } = require("./MockarooKey");
const { generateData } = require("./MockarooConfig");
const { flattenJson, flattenParams } = require("./converter");
const { startBench } = require("./bench");
const { removeGeneratedData } = require("./util")
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
    const instance = AutocannonConfig.init(req.body);

    /**
     *  we need to check if @var instance.method is [GET] or not, so we can skip
     *  payload generation.
     *
     *  @function generateData writes payload in device storage as a txt file
     *  with name (dummay_payload.txt).
     *
     *  @todo:  instead of checking operation type we might just parse empty string.
     *          we need to confirm if this will not cause any issue.
     *
     *          in the future, we might add (OPTION, HEAD)
     */

    try {
      /**
       *  we have embedded another try/catch since [Mockaroo] has custom error that we
       *  need the user to be aware of.
       *
       *  @todo:  define a function scope variable to handle differnet error states
       *          instead of embedding try/catch.
       *
       */
      await generateData(flattenJson(instance.payload));

      /**
       *  if @var dynamic_params length is more than 0, so we have params that need to be generated.
       *
       *  @function generated_data is written in device storage as a txt file with name (dummy_params.txt)
       *
       */
      if (instance.dynamic_params.length > 0) {
        await generateData(flattenParams(instance.dynamic_params), "query");
      }
    } catch (error) {
      return res.send({ data: error });
    }

    const result = await startBench();
    removeGeneratedData();
    const obj = new ApiMetrics(result);
    return res.status(200).send({ data: obj });
  } catch (error) {
    return res.status(400).send({ data: error });
  }
});

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
  /// init Mockaroo at runtime to avoid hitting /token api.
  // new MockarooKey({ token: "15fdb4d0" });
  logger.info("Client has been instantiated successfully.");
  console.log(
    `\n[!] Mocki Backend is running locally. You can benchmark your localhost APIs.`
  );
  console.log(
    `[!] Issue/Features [https://github.com/mutairibassam/mocki-ui/issues]\n`
  );
});
