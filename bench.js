const autocannon = require("autocannon");
const { AutocannonConfig } = require("./AutocannonConfig");
const { readPayload, readParams, getPath} = require("./util")

async function startBench() {
  const autocannonInstance = AutocannonConfig.getInstance();
  const params = autocannonInstance.params == '' ? '' : await readParams();
  const payload = autocannonInstance.payload == {} ? {} : await readPayload();

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
          // logging [Request Number] for user visibility and better experience
          console.log("Request Number: ", requestNumber + 1);
          request.path = getPath(params, fixed_params, path, requestNumber)
          request.body =
          payload !== undefined
              ? JSON.stringify(payload[requestNumber])
              : null;
          requestNumber++;
          /// below logs are used for debuggin purposes
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
      instance.on("start", () => {
        console.log('autocannon has been started.');
      });
      instance.on('error', (error) => {
        console.log(`autocannon has an error: ${error} `);
      });
    });
    return results;
  } catch (error) {
    console.error("Error in startBench: ", error);
    throw error;
  }
}

module.exports = { startBench };
