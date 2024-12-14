@echo off

cd .\react-app
start cmd /k npm i ^& npm start

cd ..
start cmd /k "timeout /t 5 >nul & npm i ^& npm start"
