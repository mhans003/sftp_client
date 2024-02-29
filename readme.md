# SFTP Client

This project uses the ssh2-sftp-client package to create a connection via SFTP to download specific files and folders. 

## Installation

1. Download/Clone repo to your local machine
2. Run npm install to install dependencies
3. At the root of the project, create a file called .env
4. In the .env file, create three variables to store SFTP credentials (without parentheses):
FTP_HOST=(Your SFTP Host Name Here)
FTP_USERNAME=(Your SFTP Username Here)
FTP_PASSWORD=(Your SFTP Password Here)
5. In server.js, replace the value of the variable 'prefix' with the starting path to the target server's FTP root. This will be prepended to every relative URL being accessed (e.g. "/public_html").
6. Run the app locally using node server.js
7. Open localhost:3000 in your internet browser
8. In the form input, insert a list of relative paths to be downloaded. Folders should contain an ending '/'. Files will be downloaded to the 'downloads' folder.
