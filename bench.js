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
  const path = autocannonInstance.path
  const fixed_params = autocannonInstance.fix_params

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
          request.path = getPath(params, fixed_params, path, requestNumber)
          request.body =
          payload !== undefined
              ? JSON.stringify(payload[requestNumber])
              : null;
          requestNumber++;
          // console.log(`Method: ${request.method}`);
          // console.log(`Url: ${request.origin + request.path}`);
          // request.body != undefined ? console.log(`Payload:\n ${request.body}`) : null
          return request;
        },
      },
    ],
  });
  autocannon.track(instance);
  try {
    const results = await new Promise((resolve, reject) => {
      instance.on("done", (result) => {
        console.log(result);
        if (result.error) {
          console.error("Error in finishedBench:", result.error);
          return reject(result.error);
        } else {
          return resolve(result);
        }
      });
    });
    return results;
  } catch (error) {
    console.error("Error in startBench:", error);
    throw error;
  }
}

function getPath(params, fix_params, path, requestNumber) {
  if (!params && !fix_params) {
    return path;
  } else if (params && !fix_params) {
    return path +"?"+ toQuery(params[requestNumber]);
  } else if (params && fix_params) {
    return path +"?"+ toQuery(params[requestNumber]) +"&"+ fix_params;
  } else if (!params && fix_params) {
    return path +"?"+ fix_params;
  }
}

module.exports = { startBench };
