# SFTP Client

This project uses the ssh2-sftp-client package to create a connection via SFTP to download specific files and folders. User provides a list of files and/or folder names as relative URLs (and a valid FTP root as needed) along with credentials in a .env file, and the program will establish a connection to the remote server and log information about each download into text files.

The user has two options for providing a list of files/folders for download:
-Browser Option (user inputs list and submits form to server)
-Server-Direct Option (user inputs text file and submits via command line)

## Installation

1. Download/Clone repo to your local machine
2. Run npm install to install dependencies
3. At the root of the project, create a file called .env
4. In the .env file, create three variables to store SFTP credentials (without parentheses):
FTP_HOST=(Your SFTP Host Name Here)
FTP_USERNAME=(Your SFTP Username Here)
FTP_PASSWORD=(Your SFTP Password Here)
5. In config.js, replace the value of the variable 'prefix' with the starting path to the target server's FTP root. This will be prepended to every relative URL being accessed (e.g. "/public_html"). Optionally, you can modify the filenames and/or locations of the errorOutputFile and successOutputFile variables, which is where the program will log data about downloads.

Follow steps below depending on option being used:

### Browser Option

6. In config.js, ensure the value of inputFilePath is an empty string (''). This will prevent the console from prompting the user when the Node server is run.
7. Run the Node server using 'node server.js'. 
8. Open localhost:3000 in your internet browser
9. In the form input on the rendered web page, insert a list of relative paths to be downloaded. Folders should contain an ending '/'. Files will be downloaded to the 'downloads' folder. 

### Server-Direct Option

6. In config.js, ensure the value of inputFilePath is a valid text file (e.g. 'input.txt'). This is the name of the file in the input folder where file/folder list is located. In input file, insert a list of relative paths to be downloaded. Folders should contain an ending '/'. Files will be downloaded to the 'downloads' folder.
7. Run the Node server using 'node server.js'.
8. In the terminal, you should be prompted to run the program or not. To proceed, type 'Y' and Enter. Files will be downloaded to the 'downloads' folder.




