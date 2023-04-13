const payloadInput = document.getElementById('payload');
const payloadError = document.getElementById('payload-error');

// Validate JSON payload
payloadInput.addEventListener('input', () => {
    try {
      JSON.parse(payloadInput.value);
      payloadError.textContent = '';
    } catch (error) {
      payloadError.textContent = error.message;
    }
  });
  
  // Add more headers
  const addHeaderButton = document.getElementById('add-header');
  const headersDiv = document.getElementById('headers');
  
  addHeaderButton.addEventListener('click', () => {
    const newHeaderDiv = document.createElement('div');
    newHeaderDiv.innerHTML = `
    <input type="text" name="header-key[]" placeholder="Key">
    <input type="text" name="header-value[]" placeholder="Value">
    <button type="button" class="remove-header-button">-</button>
  `;
    headersDiv.appendChild(newHeaderDiv);
  });
  
  // Submit form
  const form = document.getElementById('benchmark-form');
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData(form);
    const payload = formData.get('payload');
    console.log(payload);
  
    // Validate JSON payload
    try {
      JSON.parse(payload);
    } catch (error) {
      payloadError.textContent = error.message;
      return;
    }
  
    // Convert form data to JSON
    const json = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'header-key[]' || key === 'header-value[]') {
        continue;
      }
      json[key] = value;
    }
  
    const headers = {};
    const headerKeys = formData.getAll('header-key[]');
    const headerValues = formData.getAll('header-value[]');
    headerKeys.forEach((key, index) => {
      if (key) {
        headers[key] = headerValues[index];
      }
    });
    json.headers = headers;
  
    // Send HTTP request
    const response = await fetch('http://localhost:3001/benchmark', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    });
    const result = await response.json();
  
    // Display result
    console.log(result);
  });
  