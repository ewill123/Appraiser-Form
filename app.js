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

// Add Print Functionality
document.getElementById("printForm").addEventListener("click", function () {
  const employeeId = document.getElementById("employeeId").value;

  if (employeeId) {
    const printableContent = generatePrintableContent();
    displayPrintableContent(printableContent);
    window.print(); // Open the print dialog
  } else {
    alert("Please fetch the employee data first.");
  }
});

function generatePrintableContent() {
  const employeeName = document.getElementById("employeeName").value;
  const supervisorName = document.getElementById("supervisorName").value;
  const department = document.getElementById("department").value;
  const position = document.getElementById("position").value;
  const appraisalFrom = document.getElementById("appraisalFrom").value;
  const appraisalTo = document.getElementById("appraisalTo").value;
  const comments = document.getElementById("employeeComments").value;
  const supervisorComments = document.getElementById("supervisorComments").value;
  const profileImageUrl = document.getElementById("photoPreview").src;

  // Performance Ratings
  const ratings = [
    "attendance",
    "qualityOfWork",
    "quantityOfWork",
    "analyticalAbility",
    "motivation",
    "dependability",
    "orderliness",
    "interpersonalRelationships",
    "leadership",
    "adaptability",
    "monitoring",
  ];
  const performanceRatings = ratings.map((rating) => {
    return {
      label: rating.replace(/([A-Z])/g, " $1").toUpperCase(),
      value: document.getElementById(rating).value,
    };
  });

  // Generate HTML for printable content
  let printableHTML = `
    <div style="font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 0; width: 210mm; height: 297mm; box-sizing: border-box;">
      <div style="text-align: center; margin-bottom: 10px;">
        <h2 style="margin: 0; font-size: 16px;">Employee Performance Appraisal</h2>
      </div>
      <hr style="margin: 10px 0;" />
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="width: 70%;">
          <p><strong>Employee Name:</strong> ${employeeName}</p>
          <p><strong>Supervisor Name:</strong> ${supervisorName}</p>
          <p><strong>Department:</strong> ${department}</p>
          <p><strong>Position:</strong> ${position}</p>
          <p><strong>Appraisal Period:</strong> ${appraisalFrom} - ${appraisalTo}</p>
        </div>
        <div style="width: 25%; text-align: center;">
          <img src="${profileImageUrl}" alt="Profile Image" style="width: 80px; height: 80px; border-radius: 50%;" />
        </div>
      </div>
      <hr style="margin: 10px 0;" />
      <div>
        <h3 style="font-size: 14px; margin-bottom: 5px;">Performance Ratings</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f4f4f4; border: 1px solid #ddd;">
              <th style="padding: 5px; text-align: left; border: 1px solid #ddd;">Criteria</th>
              <th style="padding: 5px; text-align: center; border: 1px solid #ddd;">Rating</th>
            </tr>
          </thead>
          <tbody>
  `;

  performanceRatings.forEach((rating) => {
    printableHTML += `
      <tr>
        <td style="padding: 5px; border: 1px solid #ddd;">${rating.label}</td>
        <td style="padding: 5px; text-align: center; border: 1px solid #ddd;">${rating.value}</td>
      </tr>
    `;
  });

  printableHTML += `
          </tbody>
        </table>
      </div>
      <hr style="margin: 10px 0;" />
      <div>
        <h3 style="font-size: 14px; margin-bottom: 5px;">Comments</h3>
        <p style="margin: 5px 0;"><strong>Employee Comments:</strong></p>
        <p style="margin-left: 10px; font-size: 12px;">${comments}</p>
        <p style="margin: 5px 0;"><strong>Supervisor Comments:</strong></p>
        <p style="margin-left: 10px; font-size: 12px;">${supervisorComments}</p>
      </div>
    </div>
  `;

  return printableHTML;
}

// Display Printable Content
function displayPrintableContent(content) {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Printable Form</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 5px; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
}
