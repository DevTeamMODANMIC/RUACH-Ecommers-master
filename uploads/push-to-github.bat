@echo off
echo ================================================
echo          RUACH E-COMMERCE GITHUB PUSH
echo ================================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found. Please run this from the project root directory.
    pause
    exit /b 1
)

echo Checking git status...
git status

echo.
echo ================================================
echo Adding all changes to git...
git add .

echo.
echo ================================================
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message="Update RUACH E-commerce platform"

echo Committing changes with message: "%commit_message%"
git commit -m "%commit_message%"

echo.
echo ================================================
echo Setting up remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/Victorralp/rauch_ecommers.git

echo.
echo ================================================
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ================================================
if %ERRORLEVEL% EQU 0 (
    echo ✅ SUCCESS: Code pushed to GitHub successfully!
    echo Repository: https://github.com/Victorralp/rauch_ecommers
) else (
    echo ❌ ERROR: Failed to push to GitHub. Check your internet connection and GitHub credentials.
)

echo.
echo ================================================
pause