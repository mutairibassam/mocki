var Mockaroo = require("mockaroo");
const { AutocannonConfig } = require('./AutocannonConfig');
var fs = require("fs");
var client = new Mockaroo.Client({
  apiKey: "c6270330",
});

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
    this.count = instance.numConnections * instance.maxConnectionRequests || 2;
    this.fields = fields;
    this.#instance = this;
  }
  static getInstance(options) {
    return new MockarooConfig(options);
  }
}

function generateData(mockarooFields) {
  const mockarooConfig = MockarooConfig.getInstance({ fields: mockarooFields });
  
  client
    .generate({
      count: mockarooConfig.count,
      fields: mockarooConfig.fields,
    })
    .then(function (records) {
      // Convert the array to a JSON string
      const jsonData = JSON.stringify(records);
      // Write the JSON data to a file
      fs.writeFile("dummy.json", jsonData, (err) => {
        if (err) return false;
        return true
        // Download the file in the browser
        // downloadJsonFile(data, 'data.json');
      });
    })
    .catch(function (error) {
      if (error instanceof Mockaroo.errors.InvalidApiKeyError) {
        return false
      } else if (error instanceof Mockaroo.errors.UsageLimitExceededError) {
        return false
      } else if (error instanceof Mockaroo.errors.ApiError) {
        return false
      } else {
        return false
      }
    });
}

async function generateData2(mockarooFields) {
  const mockarooConfig = MockarooConfig.getInstance({ fields: mockarooFields });

  try {
    const records = await client.generate({
      count: mockarooConfig.count,
      fields: mockarooConfig.fields,
    });
    const jsonData = JSON.stringify(records);
    await fs.promises.writeFile("dummy.json", jsonData);
    console.log("Records have been saved to dummy.json");
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