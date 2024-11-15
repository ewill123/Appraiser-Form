// Import Firebase modules
import { onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4ZgSoKoq_0_1-drhHfeHUR2pznR6LbDs",
  authDomain: "staff-performance-appraisal.firebaseapp.com",
  databaseURL:
    "https://staff-performance-appraisal-default-rtdb.firebaseio.com/",
  projectId: "staff-performance-appraisal",
  storageBucket: "staff-performance-appraisal.appspot.com",
  messagingSenderId: "345808602944",
  appId: "1:345808602944:web:a9e30b76fdbd8892f05ca5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Authentication
const storage = getStorage(app);
const database = getDatabase(app);

// Logout function
function logoutUser() {
  signOut(auth)
    .then(() => {
      alert("Logged out successfully!");
      window.location.href = "index.html"; // Redirect to login page
    })
    .catch((error) => {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    });
} 

// Attach logout function to button
document.getElementById("logoutButton").addEventListener("click", logoutUser);

// Handle Image Preview and Upload to Storage
document.getElementById("photo").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const photoPreview = document.getElementById("photoPreview");

  if (file) {
    // Show local preview
    photoPreview.src = URL.createObjectURL(file);

    // Upload image to Firebase Storage
    const imageRef = storageRef(storage, `images/${file.name}`);
    uploadBytes(imageRef, file)
      .then((snapshot) => {
        // Get the image URL
        getDownloadURL(snapshot.ref)
          .then((downloadURL) => {
            const uniqueId = document.getElementById("employeeId").value; // Get unique ID
            updateImageUrl(uniqueId, downloadURL); // Save the URL in the database
            photoPreview.src = downloadURL; // Update the preview with the download URL
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
          });
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  }
});

// Toggle Ratings Visibility
document
  .getElementById("toggleShowRatings")
  .addEventListener("click", function () {
    const ratingsSection = document.getElementById("collapseOne");
    ratingsSection.classList.toggle("show");
  });

// Form Submission
document
  .getElementById("performanceForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from refreshing the page

    // Collect form data
    const supervisorId = document.getElementById("supervisorName").value;
    const uniqueId = document.getElementById("employeeId").value; // Get the unique ID
    const imageUrl = document.getElementById("photoPreview").src; // Get the image URL from the preview

    const performanceRatings = {
      attendance: {
        rating: document.getElementById("attendance").value,
      },
      qualityOfWork: {
        rating: document.getElementById("qualityOfWork").value,
      },
      quantityOfWork: {
        rating: document.getElementById("quantityOfWork").value,
      },
      analyticalAbility: {
        rating: document.getElementById("analyticalAbility").value,
      },
      motivation: {
        rating: document.getElementById("motivation").value,
      },
      dependability: {
        rating: document.getElementById("dependability").value,
      },
      orderliness: {
        rating: document.getElementById("orderliness").value,
      },
      interpersonalRelationships: {
        rating: document.getElementById("interpersonalRelationships").value,
      },
      leadership: {
        rating: document.getElementById("leadership").value,
      },
      adaptability: {
        rating: document.getElementById("adaptability").value,
      },
      monitoring: {
        rating: document.getElementById("monitoring").value,
      },
    };

    // Save existing employee data
    const data = {
      employeeName: document.getElementById("employeeName").value,
      supervisorName: supervisorId,
      department: document.getElementById("department").value,
      position: document.getElementById("position").value,
      appraisalPeriod: {
        from: document.getElementById("appraisalFrom").value,
        to: document.getElementById("appraisalTo").value,
      },
      performanceRatings: performanceRatings,
      comments: document.getElementById("employeeComments").value,
      profileImageUrl: imageUrl, // Add image URL here
      supervisorStatement: document.getElementById("supervisorComments").value, // Save the supervisor statement
    };

    // Update employee data directly since they already exist
    updateEmployeeData(supervisorId, uniqueId, data); // Save employee data
  });

// Function to update employee data
function updateEmployeeData(supervisorId, uniqueId, data) {
  const employeeRef = ref(
    database,
    `supervisors/${supervisorId}/employees/${uniqueId}`
  );

  set(employeeRef, data)
    .then(() => {
      alert("Data updated successfully!");
      document.getElementById("performanceForm").reset(); // Clear form upon successful update
      document.getElementById("photoPreview").src = ""; // Reset the photo preview
    })
    .catch((error) => alert("Data could not be updated: " + error.message));
}

// Save Image URL
function updateImageUrl(uniqueId, imageUrl) {
  const userRef = ref(database, `users/${uniqueId}`);
  set(userRef, { profileImageUrl: imageUrl })
    .then(() => console.log("Image URL updated"))
    .catch((error) => console.error("Error updating image URL:", error));
}

// Fetch Employee Data using only Employee ID
function fetchEmployeeData(employeeId) {
  const supervisorsRef = ref(database, "supervisors");

  onValue(supervisorsRef, (snapshot) => {
    const supervisorsData = snapshot.val();
    let found = false;

    for (const supervisor in supervisorsData) {
      const employeeRef = ref(
        database,
        `supervisors/${supervisor}/employees/${employeeId}`
      );

      onValue(employeeRef, (employeeSnapshot) => {
        const employeeData = employeeSnapshot.val();
        if (employeeData) {
          found = true;

          document.getElementById("employeeName").value =
            employeeData.employeeName || "";
          document.getElementById("supervisorName").value =
            employeeData.supervisorName || "";
          document.getElementById("department").value =
            employeeData.department || "";
          document.getElementById("position").value =
            employeeData.position || "";
          document.getElementById("appraisalFrom").value =
            employeeData.appraisalPeriod?.from || "";
          document.getElementById("appraisalTo").value =
            employeeData.appraisalPeriod?.to || "";

          // Set the appraiser type and make it read-only
          document.getElementById("appraiserType").value =
            employeeData.appraiserType || "";
          document.getElementById("appraiserType").readOnly = true;

          Object.keys(employeeData.performanceRatings).forEach((key) => {
            const rating = employeeData.performanceRatings[key].rating;
            document.getElementById(key).value = rating; 
            document.getElementById(key).disabled = true; 
          });

          // Set the supervisor statement
          document.getElementById("supervisorComments").value =
            employeeData.supervisorStatement || "";
          document.getElementById("supervisorComments").readOnly = true;

          makeFieldsReadOnly();

          document.getElementById("employeeComments").value =
            employeeData.comments || "";
          document.getElementById("photoPreview").src =
            employeeData.profileImageUrl || ""; 
        }
      });
    }

    if (!found) {
      alert("No data found for this employee ID.");
    }
  });
}

// Function to make fields read-only
function makeFieldsReadOnly() {
  const fieldsToLock = [
    "employeeName",
    "supervisorName",
    "department",
    "position",
    "appraisalFrom",
    "appraisalTo",
    "appraiserType",
    "employeeId",
  ];

  fieldsToLock.forEach((fieldId) => {
    document.getElementById(fieldId).readOnly = true; 
  });
}

// Fetch Employee Data on Button Click
document
  .getElementById("fetchEmployeeData")
  .addEventListener("click", function () {
    const employeeId = document.getElementById("employeeId").value;
    if (employeeId) {
      fetchEmployeeData(employeeId);
    } else {
      alert("Please enter an Employee ID.");
    }
  });
  

  // Function to generate a unique URL
function generateUniqueUrl(supervisorId, uniqueId) {
  const baseUrl = "https://your-app.com/employeeForm"; // Replace with your actual form URL
  const uniqueUrl = `${baseUrl}?supervisorId=${supervisorId}&uniqueId=${uniqueId}`;
  return uniqueUrl;
}

// Updated Form Submission
document
  .getElementById("performanceForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from refreshing the page

    // Collect form data as before
    const supervisorId = document.getElementById("supervisorName").value;
    const uniqueId = document.getElementById("employeeId").value;

    // Generate the unique URL
    const uniqueUrl = generateUniqueUrl(supervisorId, uniqueId);

    // Show the URL for copying/sharing
    displayUrl(uniqueUrl);
  });

// Function to display the generated URL
function displayUrl(uniqueUrl) {
  const urlDisplayContainer = document.createElement("div");
  urlDisplayContainer.style.marginTop = "20px";
  urlDisplayContainer.innerHTML = `
    <label>Share this link with the employee:</label>
    <input type="text" value="${uniqueUrl}" readonly style="width: 100%; padding: 5px;" />
    <button onclick="copyToClipboard('${uniqueUrl}')">Copy to Clipboard</button>
  `;
  document.getElementById("performanceForm").appendChild(urlDisplayContainer);
}

// Function to copy the URL to the clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => alert("URL copied to clipboard!"),
    (err) => alert("Failed to copy URL: " + err)
  );
}
