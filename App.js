const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({
    origin: '*', // Allow all origins
    credentials: true
}));
app.use(express.json());
// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Hello! Server is running on port 4000' });
});

// Example route
app.get('/api/test', (req, res) => {
    res.json({ status: 'success', data: 'This is a test endpoint' });
});

// Start server
app.listen(4000, () => {
    console.log(`Server is running on http://localhost:${4000}`);
});