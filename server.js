const express = require('express');
const app = express();
const path = require('path');

const { promptUser, manageConnection } = require('./functions');
const { processInput } = require('./utils');
const config = require('./config');

require('dotenv').config();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//Run from file if inputFilePath has value
if(config.inputFilePath && config.inputFilePath !== '') {
    console.log(`inputFilePath set to ${config.inputFilePath}. Proceeding will read the list of files/folders from input/${config.inputFilePath} and download them to the downloads folder.`);
    promptUser();
} else {
    console.log(`inputFilePath variable not set in config file. Provide a value for inputFilePath, OR open localhost:${PORT} and input list of files/folders to use /download API endpoint.`);
}

//Handle form submission from browser
app.post('/download', async (req, res) => {
    // Trim whitespace from each string in the array
    const trimmedFileListArray = processInput(req.body.fileList);

    try {
        await manageConnection(trimmedFileListArray); // Use await keyword here

        res.json({ message: 'Files downloaded successfully. See output logs for details.' });
    } catch (error) {
        // Respond with an error message
        res.status(500).json({ error: 'Failed to download files.' });
    }
});





