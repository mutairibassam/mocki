var Mockaroo = require("mockaroo");

/**
 * Represents a Mockaroo API key.
 *
 * This class represents a Mockaroo API key. It has a constructor that takes an options
 * object as a parameter, which should contain a `token` property representing the API token
 * for Mockaroo. If the `token` is not provided, it throws an error.
 *
 * The constructor assigns the `token` to the `apiKey` property of the instance.
 * It also creates a new instance of the `Mockaroo.Client` class from the Mockaroo library,
 * passing the `apiKey` as an option. The created instance is assigned to the `instance`
 * property of the `MockarooKey` class, allowing access to the Mockaroo API client instance.
 *
 * The class also provides a static method `getInstance()` that returns the instance
 * of `MockarooKey`. This allows accessing the same instance of `MockarooKey` throughout
 * the application.
 *
 * Note: The code assumes that the `Mockaroo` object is available and imported correctly.
 *
 *
 */
class MockarooKey {
    /**
     * Creates an instance of MockarooKey.
     * @param {object} options - The options for the MockarooKey.
     * @param {string} options.token - The API token for Mockaroo.
     * @throws {Error} If the token is not provided.
     *
     */
    constructor(options = {}) {
        if (!options.token) {
            throw new Error("Token is required");
        }
        this.apiKey = options.token || "";
        MockarooKey.instance = new Mockaroo.Client({ apiKey: this.apiKey });
    }

    /**
     * Gets the instance of MockarooKey.
     * @returns {MockarooKey} The instance of MockarooKey.
     *
     */
    static getInstance() {
        return MockarooKey.instance;
    }
}

module.exports = { MockarooKey };
