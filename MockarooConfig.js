var Mockaroo = require("mockaroo");
const { AutocannonConfig } = require('./AutocannonConfig');
const { MockarooKey } = require('./MockarooKey');
var fs = require("fs");
// var client = new Mockaroo.Client({
//   apiKey: "c6270330",
// });
// console.log(client);

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
    console.log(`number of count ${this.count}`);
    this.fields = fields;
    this.#instance = this;
  }
  static getInstance(options) {
    return new MockarooConfig(options);
  }
}

async function generateData2(mockarooFields, requester) {
  const client = MockarooKey.getInstance();
  const mockarooConfig = MockarooConfig.getInstance({ fields: mockarooFields });
  try {
    const records = await client.generate({
      count: mockarooConfig.count,
      fields: mockarooConfig.fields,
    });
    const jsonData = JSON.stringify(records);
    if(requester === "query") {
      await fs.promises.writeFile("dummy_params.json", jsonData); 
      console.log("Records have been saved to dummy_params.json");
    } else {
      await fs.promises.writeFile("dummy.json", jsonData);
      console.log("Records have been saved to dummy.json");
    }
    return [true, "valid"];
  } catch (error) {
    if (error instanceof Mockaroo.errors.InvalidApiKeyError) {
      return [false,"Invalid API key"]
    } else if (error instanceof Mockaroo.errors.UsageLimitExceededError) {
      return [false,"Usage limit exceeded"]
    } else if (error instanceof Mockaroo.errors.ApiError) {
      return [false, `API error: ${error.message}`]
    } else {
      return [false, `Unknown error: ${error}`]
    }
  }
}

module.exports = { MockarooConfig, generateData2 }