// Admin Dashboard JavaScript
let students = []; // Array to store student data
let selectedStudents = [];

let faculty = []; // Array to store student data
let selectedFaculty = [];

let selectedClass = null;
let selectedType = null;

// Function to load content into the working area
function loadContent(sectionId) {
    const workingArea = document.getElementById('working-area');
    let content = '';

    switch (sectionId) {
        case 'students':
            content = `
                <h2 id="start">Students
                <button class="btn-primary" onclick="showStudentForm()">Add New Student</button>
                </h2>

                <div id="initial-class">
                    <h3>Select Your Class</h3>
                    <form id="classForm">
                    <label for="classDropdown">Choose a class :
                    <select id="classDropdown" name="classDropdown">
                            <option value="Class 1">Class 1</option>
                            <option value="Class 2">Class 2</option>
                            <option value="Class 3">Class 3</option>
                            <option value="Class 4">Class 4</option>
                            <option value="Class 5">Class 5</option>
                            <option value="Class 6">Class 6</option>
                            <option value="Class 7">Class 7</option>
                            <option value="Class 8">Class 8</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 10">Class 10</option>
                            <option value="Class 11">Class 11</option>
                            <option value="Class 12">Class 12</option>
                    </select>
                    <button type="button" onclick="confirmClass()">Select</button>

                    </label>
                    </form>
                </div>
    
                <div id="student-form" class="form-container" style="display: none;">
                    <form id="add-student-form">
                        <b>New Student Details</b>
                        <input type="text" placeholder="Student Name" id="studentName" required>
                        <select id="studentClass" required>
                            <option value="">Select Class</option>
                            <option value="Class 1">Class 1</option>
                            <option value="Class 2">Class 2</option>
                            <option value="Class 3">Class 3</option>
                            <option value="Class 4">Class 4</option>
                            <option value="Class 5">Class 5</option>
                            <option value="Class 6">Class 6</option>
                            <option value="Class 7">Class 7</option>
                            <option value="Class 8">Class 8</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 10">Class 10</option>
                            <option value="Class 11">Class 11</option>
                            <option value="Class 12">Class 12</option>
                        </select>
                        <select id="studentGender" required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <input type="email" placeholder="Email" id="studentEmail" required>
                        <button type="submit" class="btn-submit">Add Student</button>
                    </form>
                </div>
                <div id="student-table-container" class="table-container">
                    <table id="student-table">
                        <thead>
                            <tr>
                                <th>Sr. No</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Gender</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody id="student-table-body"> </tbody>
                    </table>

                    <div id="delete-button-container">
                        <button id="delete-button" class="btn-delete" style="display: none;" onclick="deleteSelectedStudents()">Delete Students</button>
                    </div>

                </div>
            `;
            break;
        case 'faculty':
            content = `
                <h2>Faculty Management</h2>
                <button class="btn-primary" onclick="showFacultyForm()">Add New Faculty</button>
                <div id="faculty-form" class="form-container" style="display: none;">
                    <form id="add-faculty-form">
                        <b>New Faculty Details</b>
                        <input type="text" placeholder="Faculty Name" id="facultyName" required>
                        <select id="facultyGender" required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <input type="email" placeholder="Email" id="facultyEmail" required>
                        <button type="submit" class="btn-submit">Add Faculty</button>
                    </form>
                </div>
                <div id="faculty-table-container" class="table-container">
                    <table id="faculty-table">
                        <thead>
                            <tr>
                                <th>Sr. No</th>
                                <th>Name</th>
                                <th>Gender</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody id="faculty-table-body"> </tbody>
                    </table>

                  
                        <button id="fetch-button" class="btn-primary" onclick="getAllFaculty()">All Faculty</button>
                    

                    <div id="delete-button-container">
                        <button id="delete-button" class="btn-delete" style="display: none;" onclick="deleteSelectedFaculty()">Delete Faculty</button>
                    </div>

                </div>
            `;
            break;
        case 'courses':
            content = `
                <h2>Course Management</h2>
                <button class="btn-primary" onclick="showCourseForm()">Add New Course</button>
                <div id="course-form" class="form-container" style="display: none;">
                    <form id="add-course-form">
                        <input type="text" placeholder="Course Name" id="courseName" required>
                        <button type="submit" class="btn-submit">Add Course</button>
                    </form>
                </div>
                <div id="course-list" class="list-container"></div>
            `;
            break;
            case 'resources':
                content = `
                <h2>Resource Uploading</h2>
                <form id="resource-upload-form" enctype="multipart/form-data">
                    <label for="classDropdown">Select Class:</label>
                    <select id="classDropdown" name="class">
                        ${Array.from({ length: 12 }, (_, i) => `<option value="Class ${i + 1}">Class ${i + 1}</option>`).join('')}
                    </select>
                    <br><br>
                    <label for="resourceFile">Choose Resource:</label>
                    <input type="file" id="resourceFile" name="resource" required>
                    <br><br>
                    <button type="submit" id="uploadButton">Upload</button>
                </form>
                <p id="uploadStatus" style="color: green; display: none;"></p>
            `;
            break;
            
        case 'announcements':
            content = `
                <h2>Announcements</h2>
                <form id="announcement-form" class="form-container">
                    <input type="text" placeholder="Enter Announcement" id="announcement" required>
                    <button type="submit" class="btn-submit">Send Announcement</button>
                </form>
                <div id="announcement-list" class="list-container"></div>
            `;
            break;
            case 'email-messaging':
                content = `
                    <h2>Email Messaging</h2>
                    <form id="emailForm">
                        <textarea id="messageBox" placeholder="Type your message here..." required></textarea>
                        <br><br>
                        <button type="submit" id="send-msg" >Send Message</button>
                        <p id="confirmationMessage" style="color: green; display: none;"></p>
                    </form>
                `;
    break;
        default:
            content = '<h2>Welcome to the Admin Dashboard</h2>';
    }

    workingArea.innerHTML = content;
    setupEventListeners();
    if (sectionId === 'students') {
        updateStudentTable();
    }
    if (sectionId === 'resources') {
        document.getElementById('resource-upload-form').addEventListener('submit', handleResourceUpload);
    }
}

// On page load, display the admin's name in the profile section
window.onload = function () {
    const adminName = sessionStorage.getItem('adminName');
    if (adminName) {
        document.querySelector('.user-name').textContent = adminName;
    } else {
        // If no name is found, redirect back to login (optional)
        window.location.href = '../index.html';
    }
};

// Logout logic: Clear session storage and redirect to login page
document.getElementById('logout-btn').addEventListener('click', () => {
    const confirmLogout = confirm('Are you sure you want to logout?'); // Show confirmation dialog
    if (confirmLogout) {
        sessionStorage.removeItem('adminName'); // Clear the faculty name from storage
        window.location.href = '../index.html'; // Redirect to login page
    }
    // If the user clicks "Cancel", no action is taken, and they remain on the same page.
});


// Setup event listeners for forms
function setupEventListeners() {
    const addStudentForm = document.getElementById('add-student-form');
    const addFacultyForm = document.getElementById('add-faculty-form');
    const addCourseForm = document.getElementById('add-course-form');
    const announcementForm = document.getElementById('announcement-form');
    const emailForm = document.getElementById('emailForm');

    if (addStudentForm) {
        addStudentForm.addEventListener('submit', handleStudentSubmit);
    }
    if (addFacultyForm) {
        addFacultyForm.addEventListener('submit', handleFacultySubmit);
    }
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', handleCourseSubmit);
    }
    if (announcementForm) {
        announcementForm.addEventListener('submit', handleAnnouncementSubmit);
    }
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailSubmit);
    }
    // Add this part for class selection handling
    const classSubmitButton = document.getElementById('class-submit');
    const classSelect = document.getElementById('class');

    if (classSubmitButton && classSelect) {
        classSubmitButton.addEventListener('click', () => {
            const selectedClass = classSelect.value;
            handleClassSelection(selectedClass);
        });
    }
}
//Email Messaging
function handleEmailSubmit(e) {
    e.preventDefault();

    const message = document.getElementById('messageBox').value;
    const confirmationMessage = document.getElementById('confirmationMessage');

    if (!message) {
        alert('Please enter a message before sending.');
        return;
    }

    confirmationMessage.style.display = 'none';

    fetch('/api/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            confirmationMessage.textContent = 'Emails sent successfully!';
            confirmationMessage.style.display = 'block';
            document.getElementById('messageBox').value = '';
        } else {
            alert('Failed to send emails: ' + data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while sending the emails.');
    });
}

//Resource Upload
function handleResourceUpload(e) {
    e.preventDefault();

    const form = document.getElementById('resource-upload-form');
    const formData = new FormData(form);
    const uploadStatus = document.getElementById('uploadStatus');

    fetch('/api/upload-resource', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                uploadStatus.textContent = 'Resource uploaded successfully!';
                uploadStatus.style.display = 'block';
                form.reset();
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during the upload. Please try again.');
        });
}


// Event handlers
function handleStudentSubmit(e) {
    e.preventDefault();
    const studentName = document.getElementById('studentName').value;
    const studentClass = document.getElementById('studentClass').value;
    const studentGender = document.getElementById('studentGender').value;
    const studentEmail = document.getElementById('studentEmail').value;

    if (studentName && studentClass && studentGender && studentEmail) {
        addStudent(studentName, studentClass, studentGender, studentEmail);
        document.getElementById('add-student-form').reset();
        document.getElementById('student-form').style.display = 'none';
    }
}

function addStudent(name, stu_class, gender, email) {
    const newStudent = { name, class: stu_class, gender, email };
    students.push(newStudent);
    updateStudentTable();

    // Here you would typically send this data to a server
    console.log('Student added:', newStudent);
}

function updateStudentTable() {
    const tableBody = document.getElementById('student-table-body');
    tableBody.innerHTML = '';
    students.forEach((student, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.name}</td>
            <td>${student.stu_class}</td>
            <td>${student.gender}</td>
            <td>${student.email}</td>
        `;

        row.addEventListener('dblclick', () => {
            selectStudent(student.id, row);  // Select by double-clicking
        });

        row.addEventListener('click', () => {
            if (selectedStudents.length > 0) {
                selectStudent(student.id, row);  // Select by single-click if any student is already selected
            }
        });
    });
}

function refreshTable() {
    const selectedClass = document.getElementById('classDropdown').value;
    if (selectedClass) {
        getStudentsByClass(selectedClass);
    } else {
        alert('Please select a class first!');
    }
}


// Function to handle student selection
function selectStudent(studentId, row) {
    const index = selectedStudents.indexOf(studentId);

    if (index === -1) {
        // If the student isn't already selected, add them to the selected list
        selectedStudents.push(Number(studentId));  // Ensure studentId is a number
        row.classList.add('selected');
    } else {
        // If the student is already selected, remove them from the list
        selectedStudents.splice(index, 1);
        row.classList.remove('selected');
    }

    // Show or hide the delete button based on selection
    toggleDeleteButton();
}

// Function to toggle the delete button visibility
function toggleDeleteButton() {
    const deleteButton = document.getElementById('delete-button');

    if (deleteButton && selectedStudents.length > 0) {
        deleteButton.style.display = 'block';  // Show the delete button if students are selected
    } else if (deleteButton) {
        deleteButton.style.display = 'none';   // Hide if no students are selected
    }
}


// Function to delete selected students
function deleteSelectedStudents() {
    if (selectedStudents.length === 0) return;

    const confirmation = confirm('Are you sure? The selected students will be deleted permanently.');

    if (confirmation) {
        fetch('/api/students', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedStudents }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                selectedStudents = [];
                updateStudentTable();
                refreshTable();
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error deleting students. Please try again.');
            });
    }
}

function handleFacultySubmit(e) {
    e.preventDefault();
    const facultyName = document.getElementById('facultyName').value;
    const facultyGender = document.getElementById('facultyGender').value;
    const facultyEmail = document.getElementById('facultyEmail').value;
    if (facultyName && facultyGender && facultyEmail) {
        addFaculty(facultyName, facultyGender, facultyEmail);
        document.getElementById('add-faculty-form').reset();
        document.getElementById('faculty-form').style.display = 'none';
    }
}

function addFaculty(name, gender, email) {
    const newFaculty = { name, gender, email };
    faculty.push(newFaculty);
    updateFacultyTable();

    // Here you would typically send this data to a server
    console.log('Faculty added:', newFaculty);
}

function updateFacultyTable() {
    const tableBody = document.getElementById('faculty-table-body');
    tableBody.innerHTML = '';
    faculty.forEach((faculty, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
                <td>${index + 1}</td>
                <td>${faculty.name}</td>
                <td>${faculty.gender}</td>
                <td>${faculty.email}</td>
            `;

        row.addEventListener('dblclick', () => {
            selectFaculty(faculty.id, row);  // Select by double-clicking
        });

        row.addEventListener('click', () => {
            if (selectedFaculty.length > 0) {
                selectFaculty(faculty.id, row);  // Select by single-click if any student is already selected
            }
        });
    });
}

function getAllFaculty() {
    fetch('/api/faculty')
        .then(response => response.json())
        .then(data => {
            faculty = data; // Store the fetched faculty data
            updateFacultyTable(); // Display the faculty in the table
        })
        .catch(error => {
            console.error('Error fetching faculty:', error);
            alert('Error fetching faculty. Please try again.');
        });
}


// Function to handle faculty selection
function selectFaculty(facultyId, row) {
    const index = selectedFaculty.indexOf(facultyId);

    if (index === -1) {

        selectedFaculty.push(Number(facultyId));
        row.classList.add('selected');
    } else {
        selectedFaculty.splice(index, 1);
        row.classList.remove('selected');
    }

    facultyDeleteButton();
}

function facultyDeleteButton() {
    const deleteButton = document.getElementById('delete-button');

    if (deleteButton && selectedFaculty.length > 0) {
        deleteButton.style.display = 'block';  // Show the delete button if students are selected
    } else if (deleteButton) {
        deleteButton.style.display = 'none';   // Hide if no students are selected
    }
}

// Function to delete selected faculty
function deleteSelectedFaculty() {
    if (selectedFaculty.length === 0) return;

    const confirmation = confirm('Are you sure? The selected faculties will be deleted permanently.');

    if (confirmation) {
        fetch('/api/faculty', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedFaculty }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                selectedFaculty = [];
                updateFacultyTable();
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error deleting faculty. Please try again.');
            });
    }
}

function handleCourseSubmit(e) {
    e.preventDefault();
    const courseName = document.getElementById('courseName').value;
    if (courseName) {
        addCourse(courseName);
        document.getElementById('courseName').value = '';
        document.getElementById('course-form').style.display = 'none';
    }
}

function handleAnnouncementSubmit(e) {
    e.preventDefault();
    const announcement = document.getElementById('announcement').value;
    if (announcement) {
        addAnnouncement(announcement);
        document.getElementById('announcement').value = '';
    }
}

// Helper functions
function showStudentForm() {
    const form = document.getElementById('student-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function showFacultyForm() {
    const form = document.getElementById('faculty-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function showCourseForm() {
    const form = document.getElementById('course-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function addCourse(name) {
    const list = document.getElementById('course-list');
    const item = document.createElement('div');
    item.textContent = name;
    list.appendChild(item);
}

function addAnnouncement(text) {
    const list = document.getElementById('announcement-list');
    const item = document.createElement('div');
    item.textContent = text;
    list.appendChild(item);
}

// Setup navigation
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = e.currentTarget.getAttribute('href').slice(1);
        loadContent(sectionId);
    });
});

function confirmClass() {
    const selectedClass = document.getElementById('classDropdown').value;
    getStudentsByClass(selectedClass);
    alert('Fetching students for: ' + selectedClass);
}

//api calls for students
function addStudent(name, stu_class, gender, email) {
    fetch('/api/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, class: stu_class, gender, email }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Student added:', data);
            alert('New student added successfully!');
            updateStudentTable();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error adding student. Please try again.');
        });
}

function getStudentsByClass(stu_class) {
    fetch(`/api/students/${stu_class}`)
        .then(response => response.json())
        .then(data => {
            students = data; // Update the global students array
            updateStudentTable();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error fetching students. Please try again.');
        });
}

//api calls for faculty
function addFaculty(name, gender, email) {
    fetch('/api/faculty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, gender, email }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Faculty added:', data);
            alert('New faculty added successfully!');
            updateFacultyTable();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error adding faculty. Please try again.');
        });
}

// Initial load
loadContent('students');