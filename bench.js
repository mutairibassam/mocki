const autocannon = require("autocannon");
const { AutocannonConfig } = require("./AutocannonConfig");

const fs = require("fs");

async function readPayload() {
  const filename = "./dummy.json";
  try {
    const data = await fs.promises.readFile(filename);
    if (data.byteLength > 0) {
      const jsonObj = JSON.parse(data);
      return jsonObj;
    }
  } catch (error) {
    throw new Error(
      `Error reading or parsing JSON file with filename '${filename}': ${error}`
    );
  }
}

async function readParams() {
  const filename = "./dummy_params.json";
  try {
    const data = await fs.promises.readFile(filename);
    if (data.byteLength > 0) {
      const jsonObj = JSON.parse(data);
      return jsonObj;
    }
  } catch (error) {
    throw new Error(
      `Error reading or parsing JSON file with filename '${filename}': ${error}`
    );
  }
}

function toQuery(json) {
  let params = [];
  for (let key in json) {
    params.push(`${key}=${json[key]}`);
  }
  return params.join("&");
}

async function startBench() {
  const payload = await readPayload();
  const params = await readParams();
  const autocannonInstance = AutocannonConfig.getInstance();

  const url = autocannonInstance.full_path;

  const numConnections = autocannonInstance.numConnections;
  const maxConnectionRequest = autocannonInstance.maxConnectionRequests;
  const pipeline = autocannonInstance.pipeline;
  const duration = autocannonInstance.duration;

  let requestNumber = 0;

  const instance = autocannon({
    url,
    connections: numConnections,
    maxConnectionRequests: maxConnectionRequest,
    pipelining: pipeline,
    duration,
    headers: autocannonInstance.headers,
    requests: [
      {
        method: autocannonInstance.method,          
        setupRequest: function (request) {
          console.log("Request Number: ", requestNumber + 1);
          request.path = params !== undefined ? autocannonInstance.path + "?" + toQuery(params[requestNumber]) : autocannonInstance.path;
          request.body =
          payload !== undefined
              ? JSON.stringify(payload[requestNumber])
              : null;
          requestNumber++;
          return request;
        },
      },
    ],
  });
  autocannon.track(instance);
  try {
    const results = await new Promise((resolve, reject) => {
      instance.on("done", (results) => {
        if (results.error) {
          console.error("Error in finishedBench:", results.error);
          return reject(results.error);
        } else {
          return resolve(results);
        }
      });
    });
    return results;
  } catch (error) {
    console.error("Error in startBench:", error);
    throw error;
  }
}
module.exports = { startBench };
