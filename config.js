const config = {
    //Leave blank to use browser/API endpoint for downloads. To read from file, put a text file in the input fodler and enter the filename as a string below
    inputFilePath: '',
    errorOutputFile: 'output/error.txt',
    successOutputFile: 'output/success.txt',
    ftpPrefix: '/public_html'
};

module.exports = config;