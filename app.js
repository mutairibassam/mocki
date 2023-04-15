const payloadInput = document.getElementById("payload");
const payloadError = document.getElementById("payload-error");
const selectElement = document.getElementById("method");
const parentElement = document.getElementById("parentElementId");

let method = "GET";
selectElement.addEventListener("change", function () {
  method = selectElement.value;
});
// Validate JSON payload
payloadInput.addEventListener("input", () => {
  try {
    JSON.parse(payloadInput.value);
    payloadError.textContent = "";
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

// Submit form
const form = document.getElementById("benchmark-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = formData.get("payload");

  // Validate JSON payload
  if (method !== "GET") {
    if (payload.length === 0) {
      payloadError.textContent = "Selected operation required payload.";
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
  const result = await response.json();

  // Create a table element
  const table = document.createElement("table");
  const td = createTableFromObject(result, table);
  parentElement.appendChild(td);
});

function createTableFromObject(result, table) {
  for (const [key, value] of Object.entries(result)) {
    const row = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = key;
    row.appendChild(th);
    const td = document.createElement("td");
    if (typeof value === "object" && !Array.isArray(value)) {
      // Create a nested table for nested objects
      const nestedTable = document.createElement("table");
      createTableFromObject(value, nestedTable);
      td.appendChild(nestedTable);
    } else if (Array.isArray(value)) {
      // Create a list for arrays
      const ul = document.createElement("ul");
      value.forEach((val) => {
        const li = document.createElement("li");
        if (typeof val === "object" && !Array.isArray(val)) {
          // Create a nested table for nested objects in arrays
          const nestedTable = document.createElement("table");
          createTableFromObject(val, nestedTable);
          li.appendChild(nestedTable);
        } else {
          li.textContent = val;
        }
        ul.appendChild(li);
      });
      td.appendChild(ul);
    } else {
      td.textContent = value;
    }
    row.appendChild(td);
    table.appendChild(row);
  }
  return table;
}

function createTableFromObjectHorizontal(result, table) {
  const row = document.createElement("tr");
  for (const [key, value] of Object.entries(result)) {
    const th = document.createElement("th");
    th.textContent = key;
    const td = document.createElement("td");
    if (typeof value === "object" && !Array.isArray(value)) {
      // Create a nested table for nested objects
      const nestedTable = document.createElement("table");
      createTableFromObject(value, nestedTable);
      td.appendChild(nestedTable);
    } else if (Array.isArray(value)) {
      // Create a list for arrays
      const ul = document.createElement("ul");
      value.forEach((val) => {
        const li = document.createElement("li");
        if (typeof val === "object" && !Array.isArray(val)) {
          // Create a nested table for nested objects in arrays
          const nestedTable = document.createElement("table");
          createTableFromObject(val, nestedTable);
          li.appendChild(nestedTable);
        } else {
          li.textContent = val;
        }
        ul.appendChild(li);
      });
      td.appendChild(ul);
    } else {
      td.textContent = value;
    }
    row.appendChild(th);
    row.appendChild(td);
  }
  table.appendChild(row);
  return table;
}

function createTableFromObjectVertical(result, table) {
  for (const [key, value] of Object.entries(result)) {
    const row = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = key;
    const td = document.createElement("td");
    if (typeof value === "object" && !Array.isArray(value)) {
      // Create a nested table for nested objects
      const nestedTable = document.createElement("table");
      createTableFromObject(value, nestedTable);
      td.appendChild(nestedTable);
    } else if (Array.isArray(value)) {
      // Create a list for arrays
      const ul = document.createElement("ul");
      value.forEach((val) => {
        const li = document.createElement("li");
        if (typeof val === "object" && !Array.isArray(val)) {
          // Create a nested table for nested objects in arrays
          const nestedTable = document.createElement("table");
          createTableFromObject(val, nestedTable);
          li.appendChild(nestedTable);
        } else {
          li.textContent = val;
        }
        ul.appendChild(li);
      });
      td.appendChild(ul);
    } else {
      td.textContent = value;
    }
    row.appendChild(th);
    row.appendChild(td);
    table.appendChild(row);
  }
  return table;
}
