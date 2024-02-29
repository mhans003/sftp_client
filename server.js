const express = require('express');
const app = express();
const path = require('path');

let Client = require('ssh2-sftp-client');
let prefix = "/public_html";

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

//Handle form submission
app.post('/download', async (req, res) => {
    // Trim whitespace from each string in the array
    const trimmedFileListArray = processInput(req.body.fileList);

    try {
        await manageConnection(trimmedFileListArray); // Use await keyword here

        res.json({ message: 'Files downloaded successfully.' });
    } catch (error) {
        // Respond with an error message
        res.status(500).json({ error: 'Failed to download files.' });
    }
});

function processInput(fileList) {
    //Add Validation to filter out invalid paths
    //--

    const fileListArray = fileList.split('\n');
    return fileListArray.map(item => item.trim());
}

//Function to retrieve files/folders
async function manageConnection(fileList) {
    // Create a new SFTP client
    const sftp = new Client();

    try {
        // Connect to the SFTP server
        await sftp.connect({
            host: process.env.FTP_HOST,
            port: 22,
            username: process.env.FTP_USERNAME,
            password: process.env.FTP_PASSWORD
        });

        console.log(`Connected`);

        await manageItems(fileList, sftp);  
    } catch (error) {
        console.error(`SFTP connection error: ${error.message}`);
    } finally {
        // Disconnect the SFTP client
        console.log("Ending Connection");
        await sftp.end();
    }
}

async function manageItems(fileList, sftp) {
    // Iterate over the list of files
    for (const filename of fileList) {
        //Append FTP prefix to relative path
        const fullPath = prefix + filename;

        try {
            // Get the file information (e.g., file type)
            const stats = await sftp.stat(fullPath);
            //console.log(stats);

            // Check if the file is a directory
            if(stats.isDirectory) {
                await downloadFolder(fullPath, sftp);
            } else {
                await downloadFile(fullPath, sftp);
            }
        } catch (error) {
            console.error(`Failed to download "${fullPath}": ${error.message}`);
        }
    }
}

async function downloadFile(filePath, sftp) {
     // Define the local file path to save the downloaded file
     const localFile = path.join(__dirname, 'downloads', path.basename(filePath));

     // Download the file
     await sftp.fastGet(filePath, localFile);

     console.log(`File "${filePath}" downloaded successfully to "${localFile}"`);
}

async function downloadFolder(folderPath, sftp) {
    // Define the local directory path to save the downloaded directory
    const localDir = path.join(__dirname, 'downloads', path.basename(folderPath));

    // Download the directory recursively
    await sftp.downloadDir(folderPath, localDir);

    console.log(`Directory "${folderPath}" downloaded successfully to "${localDir}"`);
}

