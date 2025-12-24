const PASSWORD = "test123";

function login() {
  const input = document.getElementById("password").value;

  if (input === PASSWORD) {
    localStorage.setItem("access", "granted");
    window.location.href = "index.html";
  } else {
    document.getElementById("error").innerText = "Not quite 🤍";
  }
}

function checkAccess() {
  if (localStorage.getItem("access") !== "granted") {
    window.location.href = "login.html";
  }
}
