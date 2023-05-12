const payloadInput = document.getElementById("payload");
const payloadError = document.getElementById("payload-error");
const selectElement = document.getElementById("method");
const parentElement = document.getElementById("parentElementId");
const token_element = document.getElementById("tokenElement");

/**
 * Calculates the expected number of hits based on user input values.
 */
function calculateExpectedTotal() {
  // Retrieve the values entered in the HTML input fields
  var connectionCount = document.getElementById("connection-count").value || 5; // default value is 10
  var maxConnection = document.getElementById("requester-count").value || 5; // default value is 10
  var pipelining = document.getElementById("pipeline").value || 1; // default value is 1

  // Calculate the expected total by multiplying the values together
  var expectedTotal =
    Number(connectionCount) * Number(maxConnection) * Number(pipelining);

  // Update the HTML element with the calculated value
  document.getElementById(
    "expected-requests"
  ).textContent = `Expected number of hits: ${expectedTotal}`;
}

window.onload = calculateExpectedTotal;

document.addEventListener("input", calculateExpectedTotal);

let method = "GET";
selectElement.addEventListener("change", function () {
  method = selectElement.value;
});
// Validate JSON payload
payloadInput.addEventListener("input", () => {
  try {
    if (payloadInput.value.length !== 0) {
      JSON.parse(payloadInput.value);
      payloadError.textContent = "";
    } else {
      payloadError.textContent = "";
    }
  } catch (error) {
    payloadError.textContent = error.message;
  }
});

// function addQueryInput() {
//   // Create a new input field for a query parameter
//   var queryInput = document.createElement("div");
//   queryInput.classList.add("query-input");

//   var keyInput = document.createElement("input");
//   keyInput.classList.add("query-key");
//   keyInput.type = "text";
//   keyInput.placeholder = "Key";

//   var valueInput = document.createElement("input");
//   valueInput.classList.add("query-value");
//   valueInput.type = "text";
//   valueInput.placeholder = "Value";

//   var removeButton = document.createElement("button");
//   removeButton.type = "button";
//   removeButton.innerText = "Remove";
//   removeButton.onclick = function() {
//     queryInput.remove();
//   };

//   queryInput.appendChild(keyInput);
//   queryInput.appendChild(valueInput);
//   queryInput.appendChild(removeButton);

//   document.getElementById("query-params").appendChild(queryInput);
// }

// Add more headers
const addHeaderButton = document.getElementById("add-header");
const headersDiv = document.getElementById("headers");
addHeaderButton.addEventListener("click", () => {
  const newHeaderDiv = document.createElement("div");
  newHeaderDiv.innerHTML = `
    <input type="text" name="header-key[]" placeholder="Key">
    <input type="text" name="header-value[]" placeholder="Value">
    <button type="button" class="remove-header-button">-</button>
  `;
  headersDiv.appendChild(newHeaderDiv);

  // Add event listener to remove-header-button inside newHeaderDiv
  const removeHeaderButton = newHeaderDiv.querySelector(
    ".remove-header-button"
  );
  removeHeaderButton.addEventListener("click", () => {
    newHeaderDiv.remove();
  });
});

const tokenForm = document.getElementById("token-form");
tokenForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(tokenForm);
  const token = formData.get("token");
  // Send HTTP request
  const response = await fetch(`http://localhost:3001/token?apiKey=${token}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  token_element.textContent = data.result;
});

// Submit form

/**
 * Handles the form submission event for the benchmark form.
 * @param {Event} event - The form submission event.
 */

const form = document.getElementById("benchmark-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Retrieve form data
  const formData = new FormData(form);
  const payload = formData.get("payload");

  // Validate JSON payload
  if (method !== "GET") {
    if (payload.length === 0) {
      payloadError.textContent = "Selected method required payload.";
      return;
    }
    try {
      JSON.parse(payload);
    } catch (error) {
      payloadError.textContent = error.message;
      return;
    }
  }
  // Convert form data to JSON
  const json = {};
  for (const [key, value] of formData.entries()) {
    if (key === "header-key[]" || key === "header-value[]") {
      continue;
    }
    json[key] = value;
  }

  const headers = {};
  const headerKeys = formData.getAll("header-key[]");
  const headerValues = formData.getAll("header-value[]");
  headerKeys.forEach((key, index) => {
    if (key) {
      headers[key] = headerValues[index];
    }
  });
  json.headers = headers;
  parentElement.textContent = "";

  // Send HTTP request
  const response = await fetch("http://localhost:3001/benchmark", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });

  let result = await response.json();
  if (Object.keys(result).length > 1) {
    result = result.data;
  }
  // Create a table element and append it to the parent element
  const table = document.createElement("table");
  const td = createTableFromObject(result, table);
  parentElement.appendChild(td);
  token_element.textContent = "";
});

/**
 * Creates an HTML table from the key-value pairs of an input object.
 * @param {object} result - The input object.
 * @param {HTMLTableElement} table - The table element to append the rows.
 * @returns {HTMLTableElement} The table element with added rows.
 */
function createTableFromObject(result, table) {
  // Iterate over the key-value pairs of the input object
  for (const [key, value] of Object.entries(result)) {
    // Create a new table row
    const row = document.createElement("tr");
    // Create a new table header cell and set its content to the current key
    const th = document.createElement("th");
    th.textContent = key;
    row.appendChild(th);

    // Create a new table data cell
    const td = document.createElement("td");
    // Check the type of the current value
    if (typeof value === "object" && !Array.isArray(value)) {
      // If the value is an object (and not an array), create a nested table recursively
      const nestedTable = document.createElement("table");
      createTableFromObject(value, nestedTable);
      td.appendChild(nestedTable);
    } else if (Array.isArray(value)) {
      // If the value is an array, create an unordered list
      const ul = document.createElement("ul");
      // Iterate over the array elements
      value.forEach((val) => {
        // Create a new list item
        const li = document.createElement("li");
        if (typeof val === "object" && !Array.isArray(val)) {
          // If the array element is an object (and not an array), create a nested table recursively
          const nestedTable = document.createElement("table");
          createTableFromObject(val, nestedTable);
          li.appendChild(nestedTable);
        } else {
          // Otherwise, set the list item's content to the array element
          li.textContent = val;
        }
        // Append the list item to the unordered list
        ul.appendChild(li);
      });
      // Append the unordered list to the table data cell
      td.appendChild(ul);
    } else {
      // If the value is a simple value, set the table data cell's content to the value
      td.textContent = value;
    }
    // Append the table data cell to the table row
    row.appendChild(td);
    // Append the table row to the provided table element
    table.appendChild(row);
  }
  // Return the table element with added rows
  return table;
}
