class AutocannonConfig {
  static instance;
  headers = { "content-type": "application/json" };
  constructor(options = {}) {
    this.protocol = options.protocol || "http";
    this.baseUrl = options.baseUrl || "localhost";
    this.path = options.path.split('?').length === 2 ? options.path.split('?')[0] : options.path
    this.params = options.path.split('?').length === 2 ? options.path.split('?')[1] : ""
    if (!options.port) {
      throw new Error("Port is required");
    }
    this.port = options.port;
    this.numConnections = options.numConnections || 5;
    this.maxConnectionRequests = options.maxConnectionRequests || 5;
    this.pipeline = options.pipeline || 1;
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
    this.headers = JSON.stringify(options.headers) !== '{}' ? options.headers : this.headers
    AutocannonConfig.instance = this;

  }

  static getInstance(options = {}) {
    if (!AutocannonConfig.instance) {
      AutocannonConfig.instance = new AutocannonConfig(options);
    }
    return AutocannonConfig.instance;
  }

  get full_path() {
    // if(this.paras.length > 0) {
    //   return `${this.protocol}://${this.baseUrl}:${this.port}${this.path}?${this.params}`
    // }
    return `${this.protocol}://${this.baseUrl}:${this.port}`
  }
}

module.exports = { AutocannonConfig }