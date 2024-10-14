var Mockaroo = require("mockaroo");
const { AutocannonConfig } = require('./AutocannonConfig');
const { MockarooKey } = require('./MockarooKey');
var fs = require("fs");
const { QUERY_FILE_PATH, PAYLOAD_FILE_PATH } = require('./constants')

class MockarooConfig {
  #instance;
  constructor({ fields } = {}) {
    if (!fields || !Array.isArray(fields)) {
      throw new TypeError('fields must be an array');
    }
    if (this.#instance) {
      return this.#instance;
    }
    const instance = AutocannonConfig.getInstance();
    this.count = Number.parseInt(instance.numConnections) * Number.parseInt(instance.maxConnectionRequests) * Number.parseInt(instance.pipeline)|| 2;
    this.fields = fields;
    this.#instance = this;
  }
  static getInstance(options) {
    return new MockarooConfig(options);
  }
}

async function generateData(mockarooFields, flag) {
  const client = MockarooKey.getInstance();
  const mockarooConfig = MockarooConfig.getInstance({ fields: mockarooFields });
  try {
    const records = await client.generate({
      count: mockarooConfig.count,
      fields: mockarooConfig.fields,
    });
    const jsonData = JSON.stringify(records);
    if(flag === "query") {
      await fs.promises.writeFile(QUERY_FILE_PATH, jsonData); 
    } else {
      await fs.promises.writeFile(PAYLOAD_FILE_PATH, jsonData);
    }
  } catch (error) {
    if (error instanceof Mockaroo.errors.InvalidApiKeyError) {
      throw 'invalid api key'
    } else if (error instanceof Mockaroo.errors.UsageLimitExceededError) {
      throw 'usage limit exceeded'
    } else if (error instanceof Mockaroo.errors.ApiError) {
      throw `api error: ${error.message}`
    } else {
      throw `unknown error: ${error}`
    }
  }
}

module.exports = { MockarooConfig, generateData }