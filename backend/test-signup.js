import fetch from "node-fetch";

async function testSignup() {
  const url = "http://localhost:5000/api/auth/signup";
  const payload = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "Password123!",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("Signup Response:", data);
  } catch (err) {
    console.error("Signup failed:", err.message);
  }
}

testSignup();
