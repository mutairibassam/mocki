/**
 * Flattens a JSON object into a flat structure represented as an array of key-value pairs.
 * If the input is not a valid JSON object or is null, an empty array is returned.
 * Nested properties are prefixed with the provided prefix string (if any).
 * The function uses a mockarooTypeChecker and options object to determine the type and options of each property.
 * 
 * @param {object} json - The JSON object to flatten.
 * @param {string} prefix - The prefix to use for nested properties (optional).
 * @returns {Array} An array of key-value pairs representing the flattened JSON object.
 *
 */

function flattenJson(json, prefix = "") {
  const options = {
    Sentences: { min: 1, max: 1 },
    Age: { min: 15, max: 50 },
    "Custom List": { values: ["reading", "writing", "swimming"] },
    dob: { type: "Date", format: "%m/%d/%Y" },
    URL: {
      includeProtocol: true,
      includeHost: true,
      includeQueryString: false,
    },
    Paragraphs: { min: 1, max: 2 },
    Phone: { format: "##########" },
  };

  const flatJson = [];
  if (typeof json !== "object" || json === null) {
    return flatJson;
  }
  for (var key in json) {
    if (typeof json[key] === "object") {
      var nestedPrefix = "";
      if (Number.isInteger(parseInt(key))) {
        nestedPrefix = prefix ? prefix : key;
      } else {
        nestedPrefix = prefix ? prefix + "." + key : key;
      }
      flatJson.push(...flattenJson(json[key], nestedPrefix));
    } else {
      const name = prefix ? prefix + "." + key : key;
      const fieldType = typeof json[key];
      let type = mockarooTypeChecker(name, fieldType);
      const paramOptions = options[type] || {};

      /// exclude numbers from keys, if an array passed
      /// the result will be like
      /// "mylist": {
      ///      "first_list": ["hi", "not hi"],
      /// }
      /// key will be
      /// mylist.first_list.0
      /// and below condition removes the `0`
      if (Array.isArray(json) && Number.isInteger(parseInt(key))) {
        /// if the payload has value with an array
        /// it will repreated equal to list length
        const arrayName = name.slice(0, name.lastIndexOf("."));
        /// "mylist": {
        ///      "first_list": ["hi", "not hi"],
        /// }
        /// key will be
        /// mylist.first_list
        /// mylist.first_list
        ///
        /// keys will be repeated equal to list length
        if (!flatJson.some((item) => item.name === arrayName)) {
          flatJson.push({ name: arrayName, type, ...paramOptions });
        }
      } else {
        flatJson.push({ name, type, ...paramOptions });
      }
    }
  }
  return flatJson;
}

function flattenParams(queryParams) {
  const options = {
    Sentences: { min: 1, max: 1 },
    Age: { min: 15, max: 50 },
    "Custom List": { values: ["reading", "writing", "swimming"] },
    dob: { type: "Date", format: "%m/%d/%Y" },
    URL: {
      includeProtocol: true,
      includeHost: true,
      includeQueryString: false,
    },
    Paragraphs: { min: 1, max: 2 },
    Phone: { format: "##########" },
  };
  const queryParamsArr = queryParams.split("&");

  /**
   * Processes an array of query parameters and returns an array of objects representing each parameter.
   * @param {string[]} queryParamsArr - The array of query parameters in the format "name=value".
   * @returns {Object[]} An array of objects representing each query parameter.
   *
   */
  const result = queryParamsArr.map((queryParam) => {
    // Split the query parameter into name and value parts
    const [name, value] = queryParam.split("=");

    let parsedValue;
    try {
      // Try to parse the value as JSON
      parsedValue = JSON.parse(decodeURIComponent(value));
    } catch (error) {
      // If parsing fails, use the decoded value as is
      parsedValue = decodeURIComponent(value);
    }

    // Determine the type of the parsed value
    const mockarooType = typeof parsedValue;

    // todo: lowercase name (Not implemented)

    // Check the type against the mockarooTypeChecker function
    const type = mockarooTypeChecker(name, mockarooType);

    // Retrieve parameter options based on the type
    const paramOptions = options[type] || {};

    // Create an object representing the query parameter
    return { name, type, ...paramOptions };
  });
  return result;
}

function mockarooTypeChecker(fieldName, type) {
  let fieldType = "";
  switch (type) {
    case "string":
      if (fieldName.includes("first_name")) {
        fieldType = "First Name";
      } else if (fieldName.includes("last_name")) {
        fieldType = "Last Name";
      } else if (fieldName.includes("full_name")) {
        fieldType = "Full Name";
      } else if (fieldName.includes("name")) {
        fieldType = "Full Name";
      } else if (fieldName.includes("username")) {
        fieldType = "Username";
      } else if (fieldName.includes("password")) {
        fieldType = "Password";
      } else if (fieldName.includes("address")) {
        fieldType = "Address Line 2";
      } else if (fieldName.includes("city")) {
        fieldType = "City";
      } else if (
        fieldName.includes("state") ||
        fieldName.includes("province") ||
        fieldName.includes("region")
      ) {
        fieldType = "State";
      } else if (
        fieldName.includes("zip") ||
        fieldName.includes("post") ||
        fieldName.includes("code")
      ) {
        fieldType = "Country Code";
      } else if (fieldName.includes("country")) {
        fieldType = "Country";
      } else if (fieldName.includes("country") && fieldName.includes("code")) {
        fieldType = "Country Code";
      } else if (fieldName.includes("latitude")) {
        fieldType = "Latitude";
      } else if (fieldName.includes("longitude")) {
        fieldType = "Longitude";
      } else if (fieldName.includes("phone") || fieldName.includes("mobile")) {
        fieldType = "Phone";
      } else if (fieldName.includes("company") && fieldName.includes("name")) {
        fieldType = "Fake Company Name";
      } else if (fieldName.includes("url") || fieldName.includes("link")) {
        fieldType = "URL";
      } else if (fieldName.includes("email")) {
        fieldType = "Email Address";
      } else if (fieldName.includes("ip")) {
        fieldType = "IP Address v4";
      } else if (fieldName.includes("mac")) {
        fieldType = "MAC Address";
      } else if (fieldName.includes("credit") && fieldName.includes("number")) {
        fieldType = "Credit Card #";
      } else if (fieldName.includes("credit") && fieldName.includes("type")) {
        fieldType = "Credit Card Type";
      } else if (
        fieldName.includes("credit") &&
        fieldName.includes("expiration")
      ) {
        fieldType = "Datetime";
      } else if (fieldName.includes("cvv")) {
        fieldType = "CVV";
      } else if (fieldName.includes("isbn")) {
        fieldType = "ISBN";
      } else if (fieldName.includes("ssn")) {
        fieldType = "SSN";
      } else if (fieldName.includes("currency")) {
        fieldType = "Currency";
      } else if (fieldName.includes("date")) {
        fieldType = "Datetime";
      } else if (fieldName.includes("dob")) {
        fieldType = "Datetime";
      } else if (fieldName.includes("from")) {
        fieldType = "Datetime";
      } else if (fieldName.includes("to")) {
        fieldType = "Datetime";
      } else if (
        fieldName.toLowerCase().includes("_id") ||
        fieldName.toLowerCase().includes("mongo")
      ) {
        fieldType = "MongoDB ObjectID";
      } else {
        fieldType = "Sentences";
        options = { min: 1, max: 1 };
      }
      break;
    case "number":
      if (fieldName.toLowerCase().includes("age")) {
        fieldType = "Age";
      } else if (fieldName.includes("password")) {
        fieldType = "Password";
      } else if (
        fieldName.toLowerCase().includes("salary") ||
        fieldName.toLowerCase().includes("income")
      ) {
        fieldType = "Money";
        fieldOptions = { min: fieldValue, max: fieldValue + 5000 };
      } else if (
        fieldName.toLowerCase().includes("credit") &&
        fieldName.toLowerCase().includes("card") &&
        fieldName.toLowerCase().includes("cvv")
      ) {
        fieldType = "CVV";
      } else {
        fieldType = "Number";
      }
      break;
    case "boolean":
      fieldType = "Boolean";
      break;
    case "object":
      fieldType = "Custom List";
      break;
    default:
      fieldType = "Sentences";
      break;
  }
  return fieldType;
}

module.exports = { flattenJson, flattenParams };
