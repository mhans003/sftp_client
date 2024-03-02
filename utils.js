const fs = require('fs');

const errorOutputFile = 'output/error.txt';
const successOutputFile = 'output/success.txt';

function processInput(fileList) {
    //Add Validation to filter out invalid paths
    //--

    const fileListArray = fileList.split('\n');
    return fileListArray.map(item => item.trim());
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

module.exports = {
    initLogs,
    closeLogs,
    writeToLog,
    processInput
}