const env = require("./config/default.json").env;
const { createLogger, transports } = require("winston");
const logform = require("logform");
const { combine, timestamp, label, printf } = logform.format;

module.exports.intialize = () => {
	let prod = env === "production" ? true : false;
	module.exports.logger = createLogger({
		format: combine(
			label({ label: `${env}` }),
			timestamp(),
			printf((nfo) => {
				return `${nfo.timestamp} [${nfo.label}] ${nfo.level}: ${nfo.message} </br>`;
			})
		),
		transports: [
			new transports.Console(),
			new transports.File(prod === true ? { filename: "./logs/production.log" } : {filename: "./logs/development.log"}),
		],
	});
};