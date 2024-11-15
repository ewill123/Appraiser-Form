// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_oMBvtWlqynsNdES_jY7dthqoARARQkE",
    authDomain: "my-login-page-2f26f.firebaseapp.com",
    projectId: "my-login-page-2f26f",
    storageBucket: "my-login-page-2f26f.appspot.com",
    messagingSenderId: "341387287001",
    appId: "1:341387287001:web:3363f770e39e9c243821c8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Login functionality
document.getElementById("login-btn")?.addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Redirect to app.html without alert
            window.location.href = "app.html"; 
        })
        .catch((error) => {
            // Handle login error if needed (optional)
            console.error(`Login failed: ${error.message}`);
        });
});

// Add logout functionality only if logout-btn exists
const logoutButton = document.getElementById("logout-btn");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        auth.signOut().then(() => {
            // Redirect to index.html without alert
            window.location.href = "index.html";
        }).catch((error) => {
            // Handle logout error if needed (optional)
            console.error(`Logout failed: ${error.message}`);
        });
    });
}

// Signup functionality
document.getElementById("signup-btn")?.addEventListener("click", () => {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Redirect to login form without alert
            document.getElementById("show-login").click();
        })
        .catch((error) => {
            // Handle signup error if needed (optional)
            console.error(`Signup failed: ${error.message}`);
        });
});

// Toggle between login and signup forms
document.getElementById("show-signup")?.addEventListener("click", () => {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
    document.getElementById("form-title").textContent = "Signup Form";
});

document.getElementById("show-login")?.addEventListener("click", () => {
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
    document.getElementById("form-title").textContent = "Login Form";
});

// JavaScript to toggle the password visibility
document.getElementById("toggleLoginPassword").addEventListener("click", function () {
    const passwordField = document.getElementById("login-password");
    const icon = this;
    if (passwordField.type === "password") {
      passwordField.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash"); // Change icon to eye-slash
    } else {
      passwordField.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye"); // Change icon back to eye
    }
  });

  document.getElementById("toggleSignupPassword").addEventListener("click", function () {
    const passwordField = document.getElementById("signup-password");
    const icon = this;
    if (passwordField.type === "password") {
      passwordField.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash"); // Change icon to eye-slash
    } else {
      passwordField.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye"); // Change icon back to eye
    }
  });
