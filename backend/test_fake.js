

async function testFakeDetection() {
    console.log("Testing Fake Detection Logic...");
    
    // Using native fetch in Node 24
    const formData = new FormData();
    formData.append("title", "Test Complaint");
    // Including 'fake' to trigger the fallback logic we built
    formData.append("description", "This is a fake testing complaint");

    try {
        const response = await fetch("http://localhost:5000/api/complaints", {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        console.log("Status Code:", response.status);
        console.log("Response Body:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error during request:", err);
    }
}

testFakeDetection();
