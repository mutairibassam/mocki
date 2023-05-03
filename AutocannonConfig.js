class AutocannonConfig {
  static instance;
  headers = { "content-type": "application/json" };
  constructor(options = {}) {
    this.protocol = options.protocol || "http";
    this.baseUrl = options.baseUrl || "localhost";
    this.path = options.path.split('?').length === 2 ? options.path.split('?')[0] : options.path
    this.params = options.path.split('?').length === 2 ? options.path.split('?')[1] : ""
    this.temp1 = {};
    this.temp2 = {}; 
    
    if (this.params) {
      const paramsArray = this.params.split("&");
      for (let i = 0; i < paramsArray.length; i++) {
        const [paramName, paramValue] = paramsArray[i].split("=");
        if (paramName.startsWith("fix_")) {
          const keyWithoutPrefix = paramName.substr(4);
          this.temp1[keyWithoutPrefix] = paramValue;
        } else {
          this.temp2[paramName] = paramValue;
        }
      }
    }
    
    this.dynamic_params = new URLSearchParams(this.temp2).toString();
    this.fix_params = new URLSearchParams(this.temp1).toString();
    console.log("dynamic",this.dynamic_params);
    console.log("fix",this.fix_params);

    this.port = options.port || undefined;
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