# Installation Guide

This guide provides step-by-step instructions for setting up and running the Expo React Native application and FastAPI server from the GitHub repository. It is designed for users who are interacting with this code for the first time.

## Prerequisites

Before starting, ensure you have the following installed:

- Node.js and npm (Node Package Manager)
- Python 3.x
- Expo CLI for React Native
- A text editor or IDE of your choice (e.g., Visual Studio Code)

## Setting Up and Running the Expo React Native Application

### Cloning the Repository

1. Open a terminal or command prompt.
2. Navigate to the directory where you want to clone the repository.
3. Run: `git clone https://github.com/vanamagautam24/document_scanner_cmsc673.git`

### Installing Dependencies

1. Navigate to the cloned repository's directory: `cd client`
2. Run: `npm install` to install all the necessary dependencies.

### Starting the Expo Application

1. Ensure that Expo CLI is installed globally on your machine. If not, install it by running: `npm install -g expo-cli`
2. In the same directory as your Expo project, run: `expo start`
3. Open the Expo app on your mobile device and scan the QR code provided in the terminal.
4. Alternatively, you can use an iOS or Android simulator on your computer.

## Setting Up and Running the FastAPI Server

### Cloning the Repository

1. If not already done, open a new terminal or command prompt.
2. Navigate to the directory where you want to clone the repository.
3. Run: `git clone https://github.com/vanamagautam24/document_scanner_cmsc673`

### Installing Dependencies

1. Navigate to the FastAPI repository's directory: `cd api`.
2. Run: `pip install -r requirements.txt` to install all the required Python packages.

### Starting the FastAPI Server

1. In the FastAPI directory, run: `uvicorn api.main:app --reload`
2. The FastAPI server will start, and you can access the API at `http://127.0.0.1:8000`
3. For API documentation, navigate to `http://127.0.0.1:8000/docs`

## Installing Ngrok and Exposing a Local Web Server on Port 8000

1. Check if you have Node.js installed by running the following command in your terminal:
   node -v
If Node.js is not installed, download and install it from [nodejs.org](https://nodejs.org/).

2. Once Node.js is installed, you can install ngrok globally using npm (Node Package Manager).
npm install -g ngrok


3. Make sure you have a local web server running on port 8000.

4. In your terminal, navigate to the directory where your web server is running.

5. Run your web server. Refer to step 3.3
uvicorn api.main:app --reload


6. With your web server running, open a new terminal window or tab.

7. To expose your local web server to the internet using ngrok, use the following command:
ngrok http 8000


8. Ngrok will generate a public URL (usually in the format `https://randomstring.ngrok.io`) that you can use to access your local web server from anywhere. Copy and paste this obtained URL and replace the existing URL in the ngrokUrl variable in the following files located in the client/screens folder:
- `PreviewScreen.tsx`
- `SignInScreen.tsx`
- `CameraScreen.tsx`

### How to Run Unit Tests

cd api
python -m unittest tests.helpers_test
python -m unittest tests.users_test


## Conclusion

Following these steps should set up and run both the Expo React Native application and the FastAPI server on your local machine. For further assistance or troubleshooting, submit an issue on GitHub.

