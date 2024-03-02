const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const readline = require('readline');

let Client = require('ssh2-sftp-client');
const { Console } = require('console');
let prefix = "/public_html";

const errorOutputFile = 'output/error.txt';
const successOutputFile = 'output/success.txt';

require('dotenv').config();

//Generate prompt
const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

//Run from file if FILEPATH has value
if(process.env.FILEPATH && process.env.FILEPATH !== '') {
    console.log(`FILEPATH set to ${process.env.FILEPATH}. Proceeding will read the list of files/folders from input/${process.env.FILEPATH} and download them to the downloads folder.`);
    promptUser();
} else {
    console.log(`FILEPATH variable not set in .env file. Provide a value for FILEPATH, OR open localhost:${PORT} and input list of files/folders to use /download API endpoint.`);
}

function promptUser() {
    r1.question('PROCEED? (Y/N)', (answer) => {
        if(answer.toUpperCase() === 'Y') {
            //Initiate program from file if user affirms
            getDataFromFile();
        } else if(answer.toUpperCase() === 'N') {
            console.log("Ending Program");
            process.exit(0);
        } else {
            console.log("Invalid input. Try again.");
            promptUser();
        }
    });
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

//Process the data in the local file in FILEPATH
function getDataFromFile() {
    try {
        const data = fs.readFileSync(`input/${process.env.FILEPATH}`).toString('utf-8');
        const trimmedFileListArray = processInput(data);
        //If successful, download the listed files in the local file
        runFromFile(trimmedFileListArray);
    } catch(err) {
        console.error(`Error while reading file ${process.env.FILEPATH}: ${err}`);
    }
}

async function runFromFile(files) {
    try {
        await manageConnection(files); 

        console.log('Files downloaded successfully. See output logs for details.')
    } catch (error) {
        console.error(`Failed to download files: ${error}`);
    }
}

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

    initLogs();

    console.log(fileList);

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
            writeToLog(`Failed to download "${fullPath}": ${error.message}`, true);
        }
    }

    closeLogs();
}

async function downloadFile(filePath, sftp) {
     // Define the local file path to save the downloaded file
     const localFile = path.join(__dirname, 'downloads', path.basename(filePath));

     // Download the file
     await sftp.fastGet(filePath, localFile);

     console.log(`File "${filePath}" downloaded successfully to "${localFile}"`);
     writeToLog(`File "${filePath}" downloaded successfully to "${localFile}"`, false);
}

async function downloadFolder(folderPath, sftp) {
    // Define the local directory path to save the downloaded directory
    const localDir = path.join(__dirname, 'downloads', path.basename(folderPath));

    // Download the directory recursively
    await sftp.downloadDir(folderPath, localDir);

    console.log(`Directory "${folderPath}" downloaded successfully to "${localDir}"`);
    writeToLog(`Directory "${folderPath}" downloaded successfully to "${localDir}"`, false);
}

function initLogs() {
    const currentTime = getTime();

    writeToLog(`Successful downloads - ${currentTime}\n-----`, false);
    writeToLog(`Download Errors - ${currentTime}\n-----`, true);
}

function getTime() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';

    //Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours? hours: 12; 

    //Prevent single digit
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${month}/${day}/${year} ${hours}:${formattedMinutes} ${ampm}`;
}

function closeLogs() {
    writeToLog(`-----\n\n`, true);
    writeToLog(`-----\n\n`, false);
}

function writeToLog(message, isError) {
    const outputFile = isError ? errorOutputFile : successOutputFile;
    fs.appendFileSync(outputFile, `${message}\n`, (err) => {
        if(err) console.error(`Error writing to output file: ${err}`);
    });
}

