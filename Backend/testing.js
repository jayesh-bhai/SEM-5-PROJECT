const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());  // This allows the frontend to connect to the backend
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploads

// Create storage configuration for files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads')); // Files will be stored in 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/ /g, '_')); // Replace spaces with underscores
    }
});
const upload = multer({ storage: storage });

// Database connection configuration
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',  // Replace with your MySQL username
    password: '@BhaiBolte369',  // Replace with your MySQL password
    database: 'sims'  // Replace with your database name
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}
testConnection();

// Resource upload endpoint
app.post('/upload', upload.single('resource'), async (req, res) => {
    try {
        const file = req.file;
        const classId = req.body.classId;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        // Insert file details into database
        const [result] = await pool.execute(
            'INSERT INTO resources (class_id, file_name, file_path) VALUES (?, ?, ?)',
            [classId, file.originalname, file.filename] // Save generated filename (file.filename)
        );
        res.json({
            success: true,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File not uploaded due to some error'
        });
    }
});


// Endpoint for fetching resources based on class
app.get('/resources', async (req, res) => {
    const classId = req.query.class;
    try {
        const [results] = await pool.execute(
            'SELECT * FROM resources WHERE class_id = ?',
            [classId]
        );
        res.json(results);
    } catch (error) {
        console.error('Fetch resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resources'
        });
    }
});

// Endpoint for downloading resources
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);
    
    res.download(filepath, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(404).send('File not found');
        }
    });
});



// Default route to serve test.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'test.html'));
});

// Start server
const PORT = 7000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
