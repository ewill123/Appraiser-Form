// Import Firebase modules
import { onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4ZgSoKoq_0_1-drhHfeHUR2pznR6LbDs",
  authDomain: "staff-performance-appraisal.firebaseapp.com",
  databaseURL: "https://staff-performance-appraisal-default-rtdb.firebaseio.com/",
  projectId: "staff-performance-appraisal",
  storageBucket: "staff-performance-appraisal.appspot.com",
  messagingSenderId: "345808602944",
  appId: "1:345808602944:web:a9e30b76fdbd8892f05ca5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

// Handle Image Preview and Upload to Storage
document.getElementById("photo").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const photoPreview = document.getElementById("photoPreview");

  if (file) {
    // Show local preview
    photoPreview.src = URL.createObjectURL(file);

    // Upload image to Firebase Storage
    const imageRef = storageRef(storage, `images/${file.name}`);
    uploadBytes(imageRef, file).then((snapshot) => {
      // Get the image URL
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        const uniqueId = document.getElementById("employeeId").value; // Get unique ID
        updateImageUrl(uniqueId, downloadURL); // Save the URL in the database
        photoPreview.src = downloadURL; // Update the preview with the download URL
      }).catch((error) => {
        console.error("Error getting download URL:", error);
      });
    }).catch((error) => {
      console.error("Error uploading file:", error);
    });
  }
});

// Toggle Ratings Visibility
document.getElementById("toggleShowRatings").addEventListener("click", function () {
  const ratingsSection = document.getElementById("collapseOne");
  ratingsSection.classList.toggle("show");
});

// Form Submission
document.getElementById("performanceForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form from refreshing the page

  // Collect form data
  const supervisorId = document.getElementById("supervisorName").value;
  const uniqueId = document.getElementById("employeeId").value; // Get the unique ID
  const imageUrl = document.getElementById("photoPreview").src; // Get the image URL from the preview

  const performanceRatings = {
    attendance: {
      rating: document.getElementById("attendance").value,
      approval: document.querySelector('input[name="attendanceApproval"]:checked').value,
    },
    qualityOfWork: {
      rating: document.getElementById("qualityOfWork").value,
      approval: document.querySelector('input[name="qualityOfWorkApproval"]:checked').value,
    },
    quantityOfWork: {
      rating: document.getElementById("quantityOfWork").value,
      approval: document.querySelector('input[name="quantityOfWorkApproval"]:checked').value,
    },
    analyticalAbility: {
      rating: document.getElementById("analyticalAbility").value,
      approval: document.querySelector('input[name="analyticalAbilityApproval"]:checked').value,
    },
    motivation: {
      rating: document.getElementById("motivation").value,
      approval: document.querySelector('input[name="motivationApproval"]:checked').value,
    },
    dependability: {
      rating: document.getElementById("dependability").value,
      approval: document.querySelector('input[name="dependabilityApproval"]:checked').value,
    },
    orderliness: {
      rating: document.getElementById("orderliness").value,
      approval: document.querySelector('input[name="orderlinessApproval"]:checked').value,
    },
    interpersonalRelationships: {
      rating: document.getElementById("interpersonalRelationships").value,
      approval: document.querySelector('input[name="interpersonalRelationshipsApproval"]:checked').value,
    },
    leadership: {
      rating: document.getElementById("leadership").value,
      approval: document.querySelector('input[name="leadershipApproval"]:checked').value,
    },
    adaptability: {
      rating: document.getElementById("adaptability").value,
      approval: document.querySelector('input[name="adaptabilityApproval"]:checked').value,
    },
    monitoring: {
      rating: document.getElementById("monitoring").value,
      approval: document.querySelector('input[name="monitoringApproval"]:checked').value,
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
    profileImageUrl: imageUrl // Add image URL here
  };

  // Update employee data directly since they already exist
  updateEmployeeData(supervisorId, uniqueId, data); // Save employee data
});

// Function to update employee data
function updateEmployeeData(supervisorId, uniqueId, data) {
  const employeeRef = ref(database, `supervisors/${supervisorId}/employees/${uniqueId}`);

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
  const supervisorsRef = ref(database, 'supervisors');

  onValue(supervisorsRef, (snapshot) => {
    const supervisorsData = snapshot.val();
    let found = false;

    // Iterate through each supervisor
    for (const supervisor in supervisorsData) {
      const employeeRef = ref(database, `supervisors/${supervisor}/employees/${employeeId}`);

      onValue(employeeRef, (employeeSnapshot) => {
        const employeeData = employeeSnapshot.val();
        if (employeeData) {
          found = true;
          // Autofill the form with fetched data
          document.getElementById("employeeName").value = employeeData.employeeName || "";
          document.getElementById("supervisorName").value = employeeData.supervisorName || "";
          document.getElementById("department").value = employeeData.department || "";
          document.getElementById("position").value = employeeData.position || "";
          document.getElementById("appraisalFrom").value = employeeData.appraisalPeriod?.from || "";
          document.getElementById("appraisalTo").value = employeeData.appraisalPeriod?.to || "";

          // Set ratings and approvals
          Object.keys(employeeData.performanceRatings).forEach(key => {
            const rating = employeeData.performanceRatings[key].rating;
            const approval = employeeData.performanceRatings[key].approval;

            document.getElementById(key).value = rating; // Set the dropdown value
            const approvalRadio = document.querySelector(`input[name="${key}Approval"][value="${approval}"]`);
            if (approvalRadio) {
              approvalRadio.checked = true; // Check the appropriate radio button
            }
          });

          // Make fields read-only except for comments and radio buttons
          makeFieldsReadOnly();
          makeSupervisorRatingsReadOnly();

          document.getElementById("employeeComments").value = employeeData.comments || "";
          document.getElementById("photoPreview").src = employeeData.profileImageUrl || ""; // Set the image URL for preview
        }
      });
    }

    // If the employee was not found after checking all supervisors
    if (!found) {
      alert("No data found for this employee ID.");
    }
  });
}

// Function to make fields read-only
function makeFieldsReadOnly() {
  const fieldsToLock = [
    "employeeName", "supervisorName", "department", "position",
    "appraisalFrom", "appraisalTo"
  ];

  fieldsToLock.forEach(fieldId => {
    document.getElementById(fieldId).readOnly = true; // Make fields read-only
  });
}

// Function to make supervisor ratings read-only
function makeSupervisorRatingsReadOnly() {
  const ratingsToLock = [
    "attendance", "qualityOfWork", "quantityOfWork", "analyticalAbility",
    "motivation", "dependability", "orderliness", "interpersonalRelationships",
    "leadership", "adaptability", "monitoring"
  ];

  ratingsToLock.forEach(ratingId => {
    document.getElementById(ratingId).readOnly = true; // Make ratings read-only
  });
}

// Fetch Employee Data on Button Click
document.getElementById("fetchEmployeeData").addEventListener("click", function () {
  const employeeId = document.getElementById("employeeId").value; // Get employee ID
  fetchEmployeeData(employeeId); // Call the fetch function
});
