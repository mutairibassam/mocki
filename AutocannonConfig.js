class AutocannonConfig {
  headers = { "content-type": "application/json" };
  static instance;

  constructor(options = {}) {
    this.protocol = options.protocol || "http";
    this.baseUrl = options.baseUrl || "localhost";
    if (!options.path) {
      throw new Error("Path is required");
    }
    this.path = options.path;
    if (!options.port) {
      throw new Error("Port is required");
    }
    this.port = options.port;
    this.numConnections = options.numConnections || 10;
    this.maxConnectionRequests = options.maxConnectionRequests || 1;
    this.duration = options.duration || 10;
    this.method = options.method || "GET";
    if (
      (this.method.toUpperCase() === "POST" ||
        this.method.toUpperCase() === "PUT" ||
      this.method.toUpperCase() === "DELETE")
    ) {
      if (!options.payload) {
        throw new Error("Payload is required for selected operation");
      }
      this.payload = options.payload;
    }
    this.headers = options.headers || this.headers;
    AutocannonConfig.instance = this;

  }

  static getInstance(options = {}) {
    if (!AutocannonConfig.instance) {
      AutocannonConfig.instance = new AutocannonConfig(options);
    }
    return AutocannonConfig.instance;
  }

  get full_path() {
    return `${this.protocol}://${this.baseUrl}:${this.port}${this.path}`
  }
}

module.exports = { AutocannonConfig }