let attendanceStates = []; // Array to store attendance states

// Function to switch sections
function showSection(section) {
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  document.getElementById(section).style.display = 'block';
}

// On page load, display the faculty's name in the profile section
window.onload = function() { 
    const facultyName = sessionStorage.getItem('facultyName');
    if (facultyName) {
        document.querySelector('.user-name').textContent = facultyName;
    } else {
        // If no name is found, redirect back to login (optional)
        window.location.href = '../index.html';
    }
};

// Logout logic: Clear session storage and redirect to login page
document.getElementById('logout-btn').addEventListener('click', () => {
    const confirmLogout = confirm('Are you sure you want to logout?'); // Show confirmation dialog
    if (confirmLogout) {
        sessionStorage.removeItem('facultyName'); // Clear the faculty name from storage
        window.location.href = '../index.html'; // Redirect to login page
    }else {
        // If the user clicks "Cancel", no action is taken, and they remain on the same page.
    }
    
});


// Navigate to Attendance Page 2
function goToAttendancePage2() {
  const classSelected = document.getElementById('classSelect').value;
  const attendanceDate = document.getElementById('attendanceDate').value;
  
  if (classSelected !== '' && attendanceDate) {
      showSection('attendancePage2');
      fetchStudentsForAttendance(classSelected);
  } else {
      alert('Please select both a class and a date.');
  }
}

let goToAttendancePage1 = () => showSection('attendancePage1');

async function fetchStudentsForAttendance(classSelected) {
  const attendanceDate = document.getElementById('attendanceDate').value;
  if (!attendanceDate) {
      alert('Please select a date.');
      return;
  }

  try {
      const response = await fetch(`/api/attendance/students/${classSelected}?date=${attendanceDate}`);
      const students = await response.json();
      populateAttendanceTable(students);
  } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to fetch students. Please try again.');
  }
}

function populateAttendanceTable(students) {
    const tableBody = document.querySelector('#attendanceTable tbody');
    tableBody.innerHTML = ''; // Clear previous data
    let attendanceMarked = false;

    // Reset attendanceStates to avoid duplication on multiple calls
    attendanceStates = students.map(student => ({
        id: student.id,
        status: student.status
    }));

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        
        let attendanceCell;
        if (student.status === 'not_marked') {
            attendanceCell = `
                <td>
                    <input type="checkbox" class="attendance-checkbox" data-student-id="${student.id}">
                </td>`;
        } else {
            attendanceCell = `
                <td>
                    <span class="attendance-status">${student.status}</span>
                    <input type="checkbox" class="attendance-checkbox" data-student-id="${student.id}" style="display: none;" ${student.status === 'present' ? 'checked' : ''}>
                </td>`;
            attendanceMarked = true;
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.name}</td>
            ${attendanceCell}
        `;
        tableBody.appendChild(row);
    });

    // Show or hide the Re-mark button based on attendance status
    document.getElementById('reMarkBtn').style.display = attendanceMarked ? 'inline-block' : 'none';
}

function showAttendanceCheckboxes() {
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    const statusSpans = document.querySelectorAll('.attendance-status');

    checkboxes.forEach((checkbox, index) => {
        const studentId = checkbox.dataset.studentId;
        const attendanceRecord = attendanceStates.find(record => record.id == studentId);

        if (attendanceRecord) {
            checkbox.checked = (attendanceRecord.status === 'present');
        }

        checkbox.style.display = 'inline-block';
        if (statusSpans[index]) {
            statusSpans[index].style.display = 'none';
        }
    });

    document.getElementById('reMarkBtn').style.display = 'none'; // Hide Re-mark button after showing checkboxes
    document.getElementById('saveAttendanceBtn').style.display = 'inline-block'; // Show Save button
}

async function saveAttendance() {
    const classSelected = document.getElementById('classSelect').value;
    const attendanceDate = document.getElementById('attendanceDate').value;
    const checkboxes = document.querySelectorAll('.attendance-checkbox');

    if (!attendanceDate) {
        alert('Please select a date.');
        return;
    }

    const attendanceData = Array.from(checkboxes)
        .filter(checkbox => checkbox.parentElement.parentElement.style.display !== 'none')
        .map(checkbox => ({
            id: checkbox.dataset.studentId,
            status: checkbox.checked ? 'present' : 'absent'
        }));

    try {
        const response = await fetch('/api/attendance/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                class: classSelected,
                date: attendanceDate,
                attendanceData: attendanceData
            }),
        });

        if (response.ok) {
            alert('Attendance saved successfully!');
            
            // Update UI
            checkboxes.forEach(checkbox => {
                const status = checkbox.checked ? 'present' : 'absent';
                const statusSpan = checkbox.parentElement.querySelector('.attendance-status');
                if (statusSpan) {
                    statusSpan.textContent = status;
                    statusSpan.style.display = 'inline-block';
                }
                checkbox.style.display = 'none';
            });

            // Update attendanceStates
            attendanceStates = attendanceData;

            // Show the Re-mark button again and hide Save button
            document.getElementById('reMarkBtn').style.display = 'inline-block';
            document.getElementById('saveAttendanceBtn').style.display = 'none';

            fetchStudentsForAttendance(classSelected); // Refresh the table
        } else {
            throw new Error('Failed to save attendance');
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
        alert('Failed to save attendance. Please try again.');
    }
}

// Post Announcement
function postAnnouncement() {
  const announcementText = document.getElementById('announcement-text').value;
  if (announcementText) {
      const feed = document.getElementById('announcement-feed');
      const announcementItem = document.createElement('div');
      const timestamp = new Date().toLocaleString();
      
      announcementItem.innerHTML = `<strong>${timestamp}</strong>: ${announcementText}`;
      feed.appendChild(announcementItem);
      
      document.getElementById('announcement-text').value = ''; // Clear text area
  } else {
      alert('Please enter an announcement.');
  }
}

//Resources Uploading
document.addEventListener('DOMContentLoaded', () => {
    const resourceForm = document.getElementById('faculty-resource-upload-form');
    const allResourcesButton = document.getElementById('facultyAllResourcesButton');
    const classSelect = document.getElementById('facultyClassSelect');
    const resourcesList = document.getElementById('facultyResourcesList');

    if (resourceForm) {
        resourceForm.addEventListener('submit', handleFacultyResourceUpload);
    }

    if (classSelect) {
        classSelect.addEventListener('change', () => {
            allResourcesButton.disabled = !classSelect.value;
            resourcesList.innerHTML = ''; // Clear previous resources
        });
    }

    if (allResourcesButton) {
        allResourcesButton.addEventListener('click', handleFacultyAllResources);
    }

    function handleFacultyAllResources() {
        const selectedClass = document.getElementById('facultyClassSelect').value;
    
        if (!selectedClass) {
            alert('Please select a class first.');
            return;
        }
    
        // Clear previous content and show loading
        const resourcesList = document.getElementById('facultyResourcesList');
        resourcesList.innerHTML = '<p>Loading resources...</p>';
    
        // Add console logs for debugging
        console.log('Fetching resources for class:', selectedClass);
    
        fetch(`/api/resources/${selectedClass}`)
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data);
                
                if (Array.isArray(data)) {
                    // If the response is directly an array of resources
                    if (data.length > 0) {
                        displayFacultyResources(data);
                    } else {
                        resourcesList.innerHTML = '<p>No resources found for this class.</p>';
                    }
                } else if (data.success && data.resources) {
                    // If the response follows the expected format
                    if (data.resources.length > 0) {
                        displayFacultyResources(data.resources);
                    } else {
                        resourcesList.innerHTML = '<p>No resources found for this class.</p>';
                    }
                } else {
                    resourcesList.innerHTML = '<p>Unable to fetch resources.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching resources:', error);
                resourcesList.innerHTML = '<p>Failed to fetch resources. Please try again.</p>';
            });
    }

    function displayFacultyResources(resources) {
        const resourcesList = document.getElementById('facultyResourcesList');
        resourcesList.innerHTML = '';
    
        if (!resources || resources.length === 0) {
            resourcesList.innerHTML = '<p>No resources found for this class.</p>';
            return;
        }
    
        const table = document.createElement('table');
        table.classList.add('resources-table'); // Add a class for styling if needed
        table.innerHTML = `
            <thead>
                <tr>
                    <th>File Name</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
            ${resources.map(resource => `
                <tr>
                    <td>${resource.file_name}</td>
                    <td>${resource.uploaded_at || 'N/A'}</td>
                </tr>
            `).join('')}
            </tbody>
        `;
        resourcesList.appendChild(table);
    }
    
});

function handleFacultyResourceUpload(e) {
    e.preventDefault();

    const form = document.getElementById('faculty-resource-upload-form');
    const formData = new FormData(form);
    const uploadStatus = document.getElementById('facultyUploadStatus');

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
              
                // Added code to hide the message after 5 seconds
                setTimeout(() => {
                  uploadStatus.textContent = '';  // Clear the content
                  uploadStatus.style.display = 'none'; // Hide the element
                }, 5000); // Delay of 5 seconds (5000 milliseconds)
              }else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during the upload. Please try again.');
        });
}

