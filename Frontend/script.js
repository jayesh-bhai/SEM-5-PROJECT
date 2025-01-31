document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const overlay = document.getElementById('overlay');
    const codeOverlay = document.getElementById('codeOverlay');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const userTypeButtons = document.querySelectorAll('.user-type');
    const codePrompt = document.getElementById('codePrompt');
    const codeInput = document.getElementById('codeInput');
    const submitCode = document.getElementById('submitCode');
    const showSignup = document.getElementById('showSignup');
    const loginFormElement = document.getElementById('loginFormElement');
    const signupFormElement = document.getElementById('signupFormElement');

    let currentUserType = '';

    loginBtn.addEventListener('click', () => {
        overlay.style.display = 'flex';
    });

    userTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentUserType = button.getAttribute('data-type');
            codePrompt.textContent = `Enter Code for ${currentUserType}`;
            overlay.style.display = 'none';
            codeOverlay.style.display = 'flex';
        });
    });

    submitCode.addEventListener('click', () => {
        const code = codeInput.value;
        if (code) {
            fetch('/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, userType: currentUserType }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    codeOverlay.style.display = 'none';
                    loginForm.style.display = 'flex';
                } else {
                    alert('Invalid code. Please try again.');
                }
            })
            .catch(error => console.error('Error:', error));
            codeInput.value = ''; // Clear the input
        } else {
            alert('Please enter a code.');
        }
    });

    showSignup.addEventListener('click', () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
    });

    loginFormElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const endpoint = currentUserType === 'Student' ? '/student-login' 
                    : currentUserType === 'Faculty' ? '/faculty-login' 
                    : '/admin-login';  // Added admin login endpoint
    
    fetch(`${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Save admin name in session storage if logged in as admin
            if (currentUserType === 'Admin') {
                sessionStorage.setItem('adminName', data.name); // Store admin's name
                window.location.href = 'admin.html'; // Redirect to Admin dashboard
            } else if (currentUserType === 'Student') {
                handleSuccessfulLogin(data);
                window.location.href = 'student_dashboard.html';
            } else if (currentUserType === 'Faculty') {
                sessionStorage.setItem('facultyName', data.name); // Store faculty's name
                window.location.href = 'faculty_dashboard.html';
            }
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

function handleSuccessfulLogin(data) {
    sessionStorage.setItem('studentName', data.name);
    sessionStorage.setItem('studentId', data.studentId);
    sessionStorage.setItem('studentClass', data.studentClass);
    window.location.href = 'student_dashboard.html';
}
    signupFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const gender = document.getElementById('signupGender').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const endpoint = currentUserType === 'Student' 
                                            ? '/student-signup' 
                        : currentUserType === 'Faculty' 
                                            ? '/faculty-signup' 
                                            : '/admin-signup';  // Add admin signup endpoint
                                            
        const body = currentUserType === 'Student' 
            ? { name, gender, email, password }
            : { name, gender, email, password };

        fetch(`${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                signupForm.style.display = 'none';
                loginForm.style.display = 'flex';
                signupFormElement.reset(); 
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    [overlay, codeOverlay, loginForm, signupForm].forEach(element => {
        element.addEventListener('click', (e) => {
            if (e.target === element) {
                element.style.display = 'none';
            }
        });
    });
});