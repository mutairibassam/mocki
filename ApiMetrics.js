class ApiMetrics {
  /**
   *  
   * @param {*} data 
   * 
   */

  // "url": "http://localhost:3016/api/v1/public/create",
  // "connections": "2",
  // "sampleInt": 1000,
  // "pipelining": 1,
  // "duration": 1.01,
  // "samples": 1,
  // "start": "2023-04-14T08:32:05.342Z",
  // "finish": "2023-04-14T08:32:06.352Z",
  // "errors": 0,
  // "timeouts": 0,
  // "mismatches": 0,
  // "non2xx": 4,
  // "resets": 0,
  // "1xx": 0,
  // "2xx": 0,
  // "3xx": 0,
  // "4xx": 4,
  // "5xx": 0,
  constructor(data) {
    this.url = data.url;
    this.connections = data.connections;
    this.start = new Date(data.start).toLocaleTimeString();
    this.finish = new Date(data.finish).toLocaleTimeString();
    this.errors = data.errors;
    this.timeouts = data.timeouts;
    this.mismatches = data.mismatches;
    this.non2xx = data.non2xx;
    this["1xx"] = data["1xx"] ?? 0;
    this["2xx"] = data["2xx"] ?? 0;
    this["3xx"] = data["3xx"] ?? 0;
    this["4xx"] = data["4xx"] ?? 0;
    this["5xx"] = data["5xx"] ?? 0;
    this.statusCodeStats = new StatusCodeStats(data.statusCodeStats);
    this.latency = new Latency(data.latency);
    this.requests = new Requests(data.requests);
    this.throughput = new Throughput(data.throughput);
  }
}

class StatusCodeStats {
  /**
   * 
   * @param {*} statusCodeStats 
   */
  constructor(statusCodeStats) {
    this.stats = Object.entries(statusCodeStats).reduce((obj, [key, value]) => {
      obj[key] = new StatusCodeCount(value);
      return obj;
    }, {});
  }
}

class StatusCodeCount {
  /**
   * 
   * @param {*} param0 
   */
  constructor({ count }) {
    this.count = count;
  }
}

class Latency {
  /**
   * 
   * @param {*} param0 
   */

  // "average": 7.5,
  // "mean": 7.5,
  // "stddev": 6.5,
  // "min": 1,
  // "max": 14,
  constructor({ average, mean, stddev, min, max, totalCount }) {
    this.average = average;
    this.mean = mean;
    this.stddev = stddev;
    this.min = min;
    this.max = max;
    this.totalCount = totalCount;
  }
}

class Requests {
  /**
   * 
   * @param {*} param0 
   */

  // "average": 4,
  // "mean": 4,
  // "stddev": 0,
  // "min": 4,
  // "max": 4,
  // "total": 4,
  // "sent": 4
  constructor({ average, mean, stddev, min, max, total, sent }) {
    this.average = average;
    this.mean = mean;
    this.stddev = stddev;
    this.min = min;
    this.max = max;
    this.total = total;
    this.sent = sent;
  }
}

class Throughput {
  /**
   * 
   * @param {*} param0 
   */
  
  // "average": 4714,
  // "mean": 4714,
  // "stddev": 0,
  // "min": 4712,
  // "max": 4712,
  // "total": 4712,
  constructor({ average, mean, stddev, min, max, total }) {
    this.average = average;
    this.mean = mean;
    this.stddev = stddev;
    this.min = min;
    this.max = max;
    this.total = total;
  }
}

module.exports = { ApiMetrics };
