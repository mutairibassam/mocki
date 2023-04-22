var Mockaroo = require("mockaroo");

class MockarooKey {
  static instance;
  constructor(options = {}) {
    console.log(options);
    if (!options.token) {
      throw new Error("Token is required");
    }
    this.apiKey = options.token || "";
    MockarooKey.instance = new Mockaroo.Client({ apiKey: this.apiKey})
  }

  static getInstance() {
    return MockarooKey.instance;
  }
}

module.exports = { MockarooKey }