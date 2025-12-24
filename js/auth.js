// Password
const PASSWORD = "secret123";

// Make login function global
window.login = function() {
  const input = document.getElementById("password").value;
  const error = document.getElementById("error");

  if (input === PASSWORD) {
    localStorage.setItem("access", "granted");
    window.location.href = "index.html";
  } else {
    document.getElementById("error").innerText = "Not quite 🤍";
  }
};

// Protect pages
window.checkAccess = function() {
  if (localStorage.getItem("access") !== "granted") {
    window.location.href = "login.html";
  }
};

console.log("auth.js loaded");
