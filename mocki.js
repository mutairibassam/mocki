var Mockaroo = require("mockaroo");

var client = new Mockaroo.Client({
  apiKey: "xxxxxx",
});

client.generate({
    count: 2,
    fields:  [
			{ name: 'name', type: "First Name" },
			{ name: 'age', type: 'Number' },
			{ name: 'address.street', type: "Street" },
			{ name: 'address.city', type: 'City' },
			{ name: 'address.state', type: 'State' },
			{ name: 'address.zip', type: 'Zip' },
			{ name: 'phoneNumbers.type', type: 'Phone' },
			{ name: 'phoneNumbers.number', type: 'Phone' }
		]
}).then(function(records) {
    console.log(records);
    for (var i=0; i<records.length; i++) {
        var record = records[i];
        console.log('record ' + i, 'id:' + record.id + ', transactionType:' + record.transactionType);
    }
}).catch(function(error) {
    if (error instanceof Mockaroo.errors.InvalidApiKeyError) {
      console.log('invalid api key');
    } else if (error instanceof Mockaroo.errors.UsageLimitExceededError) {
      console.log('usage limit exceeded');
    } else if (error instanceof Mockaroo.errors.ApiError) {
      console.log('api error: ' + error.message);
    } else {
      console.log('unknown error: ' + error);
    }
});

const payload = {
  data: {
    mobile: "0587654321",
    external: {
      portfolio: "https://mutairibassam.com",
      parent_list: ["hi", "not hi", "hii"],
      mylist: {
        first_list: ["hi", "not hi"],
        second_list: ["not", "hi"],
      },
    },
  },
};

function flattenJson(json, prefix = "") {
  const flatJson = [];
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
      const type = typeof json[key];
      const mockarooType = mockarooTypeChecker(name, type);

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
          flatJson.push({ name: arrayName, mockarooType });
        }
      } else {
        flatJson.push({ name, mockarooType });
      }
    }
  }
  return flatJson;
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
      } else if (fieldName.includes("username")) {
        fieldType = "Username";
      } else if (fieldName.includes("password")) {
        fieldType = "Password";
      } else if (fieldName.includes("address")) {
        fieldType = "Address";
      } else if (fieldName.includes("city")) {
        fieldType = "City";
      } else if (
        fieldName.includes("state") ||
        fieldName.includes("province") ||
        fieldName.includes("region")
      ) {
        fieldType = "State / Province / Region";
      } else if (
        fieldName.includes("zip") ||
        fieldName.includes("post") ||
        fieldName.includes("code")
      ) {
        fieldType = "Zipcode / Postcode";
      } else if (fieldName.includes("country")) {
        fieldType = "Country";
      } else if (fieldName.includes("latitude")) {
        fieldType = "Latitude";
      } else if (fieldName.includes("longitude")) {
        fieldType = "Longitude";
      } else if (fieldName.includes("phone") || fieldName.includes("mobile")) {
        fieldType = "Phone";
      } else if (fieldName.includes("company") && fieldName.includes("name")) {
        fieldType = "Company Name";
      } else if (fieldName.includes("company") && fieldName.includes("email")) {
        fieldType = "Company Email";
      } else if (fieldName.includes("url") || fieldName.includes("link")) {
        fieldType = "URL";
      } else if (fieldName.includes("email")) {
        fieldType = "Email";
      } else if (fieldName.includes("ip")) {
        fieldType = "IP Address";
      } else if (fieldName.includes("mac")) {
        fieldType = "MAC Address";
      } else if (fieldName.includes("credit") && fieldName.includes("number")) {
        fieldType = "Credit Card Number";
      } else if (fieldName.includes("credit") && fieldName.includes("type")) {
        fieldType = "Credit Card Type";
      } else if (
        fieldName.includes("credit") &&
        fieldName.includes("expiration")
      ) {
        fieldType = "Credit Card Expiration Date";
      } else if (fieldName.includes("cvv")) {
        fieldType = "CVV";
      } else if (fieldName.includes("isbn")) {
        fieldType = "ISBN";
      } else if (fieldName.includes("ssn")) {
        fieldType = "SSN";
      } else if (fieldName.includes("currency")) {
        fieldType = "Currency";
      } else if (fieldName.includes("from")) {
        fieldType = "Date";
      } else if (fieldName.includes("to")) {
        fieldType = "Date";
      } else {
        fieldType = "Short Text";
      }
      break;
    case "number":
      if (fieldName.toLowerCase().includes("age")) {
        fieldType = "Age";
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
      if (
        fieldName.toLowerCase().includes("_id") ||
        fieldName.toLowerCase().includes("mongo")
      ) {
        fieldType = "MongoDB ObjectID";
      } else {
        fieldType = "Object";
      }
      break;
    default:
      fieldType = "Text";
      break;
  }
  return fieldType;
}

const flatJson = flattenJson(payload);
console.log(flatJson);