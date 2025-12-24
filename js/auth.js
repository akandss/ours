// Password
const PASSWORD = "onalaska";

// Make login function global
window.login = function() {
  const input = document.getElementById("password").value;
  const error = document.getElementById("error");

  if (input === PASSWORD) {
    sessionStorage.setItem("access", "granted");
    window.location.href = "index.html";
  } else {
    document.getElementById("error").innerText = "Not quite 🤍";
  }
};

// Protect pages
window.checkAccess = function() {
  if (sessionStorage.getItem("access") !== "granted") {
    window.location.href = "login.html";
  }
};

console.log("auth.js loaded");
