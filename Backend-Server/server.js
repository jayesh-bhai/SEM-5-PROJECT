require('dotenv').config();
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass exists:', !!process.env.EMAIL_PASS);
const express = require('express');
const mysql = require('mysql2/promise'); 
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');


const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true
});

transporter.verify(function(error, success) {
    if (error) {
        console.log('Transporter verification error:', error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

const storage = multer.memoryStorage();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB size limit
});


// Create MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '@BhaiBolte369',
    database: 'sims',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Verify student, faculty and Admin
app.post('/verify-code', async (req, res) => {
    const { code, userType } = req.body;

    let query = '';
    if (userType === 'Student') {
        query = 'SELECT * FROM student_codes WHERE BINARY code = ?';
    } else if (userType === 'Faculty') {
        query = 'SELECT * FROM faculty_codes WHERE BINARY code = ?';
    } else if (userType === 'Admin') {
        query = 'SELECT * FROM admin_codes WHERE BINARY code = ?';
    }

    try {
        const [results] = await pool.execute(query, [code]);
        res.json({ valid: results.length > 0 });
    } catch (err) {
        console.error('Error verifying code:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// Student login
app.post('/student-login', async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM students WHERE email = ? AND password = ?';

    try {
        const [results] = await pool.execute(query, [email, password]);

        if (results.length > 0) {
            const student = results[0];
            // Fetch additional info from new_students table
            const [newStudentInfo] = await pool.execute(
                'SELECT id, stu_class FROM new_students WHERE email = ?',
                [email]
            );
            
            if (newStudentInfo.length > 0) {
                res.json({ 
                    success: true, 
                    message: 'Login successful', 
                    name: student.name,
                    studentId: newStudentInfo[0].id,
                    studentClass: newStudentInfo[0].stu_class
                });
            } else {
                res.json({ success: false, message: 'Student info not found' });
            }
        } else {
            res.json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Error logging in student:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Database query failed' });
        }
    }
});

// Student signup
app.post('/student-signup', async (req, res) => {
    const { name, gender, email, password } = req.body;
    const query = 'INSERT INTO students (name, gender, email, password) VALUES (?, ?, ?, ?)';

    try {
        await pool.execute(query, [name, gender, email, password]);
        res.json({ success: true, message: 'Signup successful' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.json({ success: false, message: 'Email already exists' });
        } else {
            console.error('Error signing up student:', err);
            res.status(500).json({ error: 'Database query failed' });
        }
    }
});

// Faculty login
app.post('/faculty-login', async (req, res) => {
  const { email, password } = req.body; // Extract email and password from the request body
  const query = 'SELECT * FROM faculty WHERE email = ? AND password = ?'; // SQL query to check credentials in faculty table

  try {
      const [results] = await pool.execute(query, [email, password]); // Execute the query

      if (results.length > 0) {
          // Assuming the faculty name is in the "name" field
          const faculty = results[0]; // Get the faculty details from the first result
          res.json({ success: true, message: 'Login successful', name: faculty.name }); // Respond with success and faculty name
      } else {
          res.json({ success: false, message: 'Invalid email or password' }); // Respond with failure message if credentials don't match
      }
  } catch (err) {
      console.error('Error logging in faculty:', err); // Log any errors for debugging

      // Ensure only one response is sent
      if (!res.headersSent) {
          res.status(500).json({ error: 'Database query failed' }); // Send a 500 error if there's an issue with the database
      }
  }
});


// Faculty signup
app.post('/faculty-signup', async (req, res) => {
    const { name, gender, email, password } = req.body;
    const query = 'INSERT INTO faculty (name, gender, email, password) VALUES (?, ?, ?, ?)';

    try {
        await pool.execute(query, [name, gender, email, password]);
        res.json({ success: true, message: 'Signup successful' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.json({ success: false, message: 'Email already exists' });
        } else {
            console.error('Error signing up faculty:', err);
            res.status(500).json({ error: 'Database query failed' });
        }
    }
});

// Admin login
app.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM admin WHERE email = ? AND password = ?';

    try {
        const [results] = await pool.execute(query, [email, password]);

        if (results.length > 0) {
            // Assuming the admin name is in the "name" field
            const admin = results[0];
            res.json({ success: true, message: 'Login successful', name: admin.name });
        } else {
            res.json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Error logging in admin:', err);

        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(500).json({ error: 'Database query failed' });
        }
    }
});


// Admin signup
app.post('/admin-signup', async (req, res) => {
    const { name, gender, email, password } = req.body;
    const query = 'INSERT INTO admin (name, gender, email, password) VALUES (?, ?, ?, ?)';

    try {
        await pool.execute(query, [name, gender, email, password]);
        res.json({ success: true, message: 'Signup successful' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.json({ success: false, message: 'Email already exists' });
        } else {
            console.error('Error signing up admin:', err);
            res.status(500).json({ error: 'Database query failed' });
        }
    }
});

//Student Backend Code Begins

// New API endpoint to add a student
app.post('/api/students', async (req, res) => {
    const { name, class: studentClass, gender, email } = req.body;
  
    try {
      const [result] = await pool.execute(
        'INSERT INTO new_students (name, stu_class, gender, email) VALUES (?, ?, ?, ?)',
        [name, studentClass, gender, email]
      );
  
      res.status(201).json({ message: 'Student added successfully', id: result.insertId });
    } catch (error) {
      console.error('Error adding student:', error);
      res.status(500).json({ error: 'Error adding student' });
    }
  });
  
  // New API endpoint to get students by class
  app.get('/api/students/:class', async (req, res) => {
    const studentClass = req.params.class;
  
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM new_students WHERE stu_class = ?',
        [studentClass]
      );
  
      res.json(rows);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Error fetching students' });
    }
  });
  
  // API endpoint to delete students
  app.delete('/api/students', async (req, res) => {
    const { ids } = req.body;
  
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No students selected for deletion' });
    }
  
    try {
      // Convert ids to numbers to ensure they are treated as integers
      const numericIds = ids.map(id => {
        const numId = Number(id);
        if (isNaN(numId)) {
          throw new Error(`Invalid ID: ${id}`);  // If the ID is not a number, throw an error
        }
        return numId;
      });
  
      // Create a string of question marks for the SQL query
      const placeholders = numericIds.map(() => '?').join(',');
  
      // Use MySQL DELETE query to remove the selected students
      await pool.execute(`DELETE FROM new_students WHERE id IN (${placeholders})`, numericIds);
      res.json({ message: 'Students deleted successfully' });
    } catch (error) {
      console.error('Error deleting students:', error);
      res.status(500).json({ error: 'Error deleting students' });
    }
  });
  
//Admin faculty Backend Code Begins

// New API endpoint to add a faculty
app.post('/api/faculty', async (req, res) => {
    const { name, gender, email } = req.body;
  
    try {
      const [result] = await pool.execute(
        'INSERT INTO new_faculty (name, gender, email) VALUES (?, ?, ?)',
        [name, gender, email]
      );
  
      res.status(201).json({ message: 'Faculty added successfully', id: result.insertId });
    } catch (error) {
      console.error('Error adding faculty:', error);
      res.status(500).json({ error: 'Error adding faculty' });
    }
  });
  
  // API endpoint to delete faculty
  app.delete('/api/faculty', async (req, res) => {
    const { ids } = req.body;
  
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No faculty selected for deletion' });
    }
  
    try {
      // Convert ids to numbers to ensure they are treated as integers
      const numericIds = ids.map(id => {
        const numId = Number(id);
        if (isNaN(numId)) {
          throw new Error(`Invalid ID: ${id}`);
        }
        return numId;
      });
  
      // Create a string of question marks for the SQL query
      const placeholders = numericIds.map(() => '?').join(',');
  
      // Use MySQL DELETE query to remove the selected students
      await pool.execute(`DELETE FROM new_faculty WHERE id IN (${placeholders})`, numericIds);
      res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
      console.error('Error deleting faculty:', error);
      res.status(500).json({ error: 'Error deleting faculty' });
    }
  });

// API endpoint to get all faculty members
app.get('/api/faculty', async (req, res) => {
  try {
      const [rows] = await pool.execute('SELECT * FROM new_faculty');
      res.json(rows); // Send the faculty data as a JSON response
  } catch (error) {
      console.error('Error fetching faculty:', error);
      res.status(500).json({ error: 'Error fetching faculty' });
  }
});

//Attendance logic
// Get students by class for attendance
app.get('/api/attendance/students/:class', async (req, res) => {
  const studentClass = req.params.class;
  const date = req.query.date; // Get the date from query parameters
  try {
      // Fetch students and their attendance status for the given date
      const [rows] = await pool.execute(`
          SELECT ns.id, ns.name, 
              CASE WHEN a.status IS NOT NULL THEN a.status ELSE 'not_marked' END AS status
          FROM new_students ns
          LEFT JOIN attendance a ON ns.id = a.student_id AND a.date = ?
          WHERE ns.stu_class = ?
      `, [date, studentClass]);
      res.json(rows);
  } catch (error) {
      console.error('Error fetching students for attendance:', error);
      res.status(500).json({ error: 'Error fetching students for attendance' });
  }
});

// Save attendance
app.post('/api/attendance/save', async (req, res) => {
  const { class: studentClass, date, attendanceData } = req.body;
  try {
      for (const record of attendanceData) {
          const { id, status } = record;

          // Check if an attendance record already exists
          const [existing] = await pool.execute(
              'SELECT * FROM attendance WHERE student_id = ? AND date = ?',
              [id, date]
          );

          if (existing.length > 0) {
              // If a record exists, update it
              await pool.execute(
                  'UPDATE attendance SET status = ? WHERE student_id = ? AND date = ?',
                  [status, id, date]
              );
          } else {
              // If no record exists, insert the new attendance
              await pool.execute(
                  'INSERT INTO attendance (student_id, class, date, status) VALUES (?, ?, ?, ?)',
                  [id, studentClass, date, status]
              );
          }
      }
      res.json({ message: 'Attendance saved successfully' });
  } catch (error) {
      console.error('Error saving attendance:', error);
      res.status(500).json({ error: 'Error saving attendance' });
  }
});

// New endpoint for fetching student attendance
app.get('/api/student-attendance', async (req, res) => {
    const { studentId, date, class: studentClass } = req.query;

    if (!studentId || !date || !studentClass) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // First, verify if the student exists and belongs to the specified class
        const [studentRows] = await pool.execute(
            'SELECT * FROM new_students WHERE id = ? AND stu_class = ?',
            [studentId, studentClass]
        );

        if (studentRows.length === 0) {
            return res.status(404).json({ error: 'Student not found or class mismatch' });
        }

        // Fetch attendance for the student on the specified date
        const [attendanceRows] = await pool.execute(
            'SELECT date, status FROM attendance WHERE student_id = ? AND date = ?',
            [studentId, date]
        );

        if (attendanceRows.length === 0) {
            return res.json({ date, status: 'Not marked' });
        }

        res.json(attendanceRows[0]);
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ error: 'Error fetching attendance' });
    }
});
// Route to handle sending emails
app.post('/api/send-email', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
    }

    try {
        // Fetch student emails from database
        const [results] = await pool.query('SELECT email FROM new_students');
        
        const studentEmails = results.map(row => row.email);

        if (studentEmails.length === 0) {
            return res.status(404).json({ success: false, message: 'No students found' });
        }

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: studentEmails.join(','),  // Join all emails into a single string
            subject: 'Message from Admin',
            text: message
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Emails sent: ' + info.response);
        res.status(200).json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send emails', error: error.message });
    }
});

app.post('/api/resources', upload.single('resource'), (req, res) => {
    console.log("Upload route hit");
    console.log(req.file); // Log the uploaded file details
    console.log(req.body); // Log the form data
    const { class: className, type } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File buffer length:', file.buffer.length);
    console.log('Inserting into DB:', { className, type, fileName: file.originalname, fileSize: file.size, fileType: file.mimetype });

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).json({ error: 'Error connecting to database' });
        }

        const query = 'INSERT INTO resources (class, type, file_name, file_data, file_mimetype) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [className, type, file.originalname, file.buffer, file.mimetype], (err, result) => {
            connection.release(); // Always release the connection back to the pool

            if (err) {
                console.error('Database query error:', err.message); // More descriptive error logging
                return res.status(500).json({ error: 'Error uploading resource' });
            }

            res.status(201).json({ 
                message: 'Resource uploaded successfully',
                resourceId: result.insertId
            });
        });
    });
});


// Get Resources with database connection using pool
app.get('/api/resources', (req, res) => {
    const { class: className, type } = req.query;
    const query = 'SELECT * FROM resources WHERE class = ? AND type = ?';

    // Obtain a connection from the pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error connecting to database');
        }

        // Execute the query using the connection
        connection.query(query, [className, type], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching resources');
            }

            // Release the connection back to the pool
            connection.release();

            res.json(results);
        });
    });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('MySQL Database Connected')
});
