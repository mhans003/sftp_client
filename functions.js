//Main Functions

const path = require('path');
const fs = require('fs');
let Client = require('ssh2-sftp-client');
const readline = require('readline');

const { processInput, initLogs, closeLogs, writeToLog } = require('./utils');
const config = require('./config');

function promptUser() {
    //Generate prompt
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
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

//Process the data in the local file in inputFilePath
function getDataFromFile() {
    try {
        const data = fs.readFileSync(`input/${config.inputFilePath}`).toString('utf-8');
        const trimmedFileListArray = processInput(data);
        //If successful, download the listed files in the local file
        runFromFile(trimmedFileListArray);
    } catch(err) {
        console.error(`Error while reading file ${config.inputFilePath}: ${err}`);
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

        initLogs();
        await manageItems(fileList, sftp);  
        closeLogs();
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
        const fullPath = config.ftpPrefix + filename;

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

module.exports = {
    promptUser,
    manageConnection
}