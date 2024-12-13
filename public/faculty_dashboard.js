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


// Initialize default section to Attendance Page 1
document.addEventListener('DOMContentLoaded', () => {
  showSection('attendancePage1');
});





