async function callAPI(endpoint, payload) {
  try {
    const response = await fetch(`http://localhost:5000/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    console.error("API error:", error);
    alert("Failed to connect to AI server");
  }
}
