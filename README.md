# Project Introduction

Welcome to RenderWare Model Manager, a desktop application built using Electron and React. This project aims to provide a user-friendly interface for managing your GTA 3, GTA VC and GTA SA models.

# Getting Started

**Important**: Before running the application for the first time, please run `npm run build` in the root folder to build the Electron application. Also it is possible that your Electron window will start before the React project is up and running, in this case press `Ctrl + R` in the Electron window to see see the application runnning in the window.

To start the application, you can use one of the following methods:

## Method 1: Using the run.bat file

1. Download the repository and navigate to the root directory.
2. Double-click on the `run.bat` file to start the application.

## Method 2: Manual Installation

1. Download the repository and navigate to the `react-app` folder.
2. Run `npm i` to install the dependencies.
3. Run `npm start` to start the React development server.
4. Navigate to the root directory and run `npm i` to install the Electron dependencies.
5. Run `npm start` to start the Electron application.

**Note:** Make sure you have Node.js and npm installed on your system before running the above commands.

# Project Structure

The project is divided into two main folders:

- `/react-app`: contains the React application code.
- `root`: contains the Electron application code.