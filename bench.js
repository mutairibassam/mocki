const autocannon = require("autocannon");
const { AutocannonConfig } = require("./AutocannonConfig");

const fs = require("fs");

async function read() {
  const filename = "./dummy.json";
  try {
    const data = await fs.promises.readFile(filename);
    const jsonObj = JSON.parse(data);
    return jsonObj;
  } catch (error) {
    throw new Error(
      `Error reading or parsing JSON file with filename '${filename}': ${error}`
    );
  }
}

async function startBench() {
  const dummy = await read();
  const autocannonInstance = AutocannonConfig.getInstance();

  const url = autocannonInstance.full_path;

  const numConnections = autocannonInstance.numConnections;
  const maxConnectionRequests = autocannonInstance.maxConnectionRequests;
  const duration = autocannonInstance.duration;

  let requestNumber = 0;

  const instance = autocannon({
    url,
    connections: numConnections,
    maxConnectionRequests: maxConnectionRequests,
    duration: duration,
    method: autocannonInstance.method,
    headers: autocannonInstance.headers,
    requests: [
      {
        path: autocannonInstance.path,
        setupRequest: function (request) {
          console.log("Request Number: ", requestNumber + 1);
          request.body = JSON.stringify(dummy[requestNumber]);
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
    return results; // return the results object
  } catch (error) {
    console.error("Error in startBench:", error);
    throw error;
  }
}
module.exports = { startBench };
