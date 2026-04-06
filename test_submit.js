const axios = require('axios');

async function test() {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('title', 'Test Pothole');
    form.append('description', 'There is a massive pothole causing a huge issue right now.');
    form.append('location[latitude]', '40.0');
    form.append('location[longitude]', '-74.0');

    const res = await axios.post('http://localhost:5000/api/complaints', form, {
      headers: form.getHeaders()
    });

    console.log("RESPONSE DATA:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error("ERROR DATA:", err.response.data);
    } else {
      console.error(err);
    }
  }
}

test();
