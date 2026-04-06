async function testFetch() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login/step1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@smartcity.gov', password: 'password123' })
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch(e) {
    console.error(e);
  }
}
testFetch();
