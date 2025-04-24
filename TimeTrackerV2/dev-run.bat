@echo off

docker-compose up -d node

cd ./Angular

IF NOT EXIST "node_modules" (
    echo node_modules directory not found. Installing dependencies...
    npm install
) ELSE (
    echo node_modules already exists. Skipping npm install.
)

cmd /k "ng serve" 