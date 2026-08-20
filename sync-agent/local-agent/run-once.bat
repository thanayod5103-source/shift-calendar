@echo off
setlocal
cd /d "%~dp0"
if not exist config.json (
  echo ERROR: config.json not found.
  echo Copy config.example.json to config.json and set workbook_path first.
  pause
  exit /b 1
)
py -3 -m pip install -r requirements.txt
if errorlevel 1 (
  echo ERROR: Python packages could not be installed.
  pause
  exit /b 1
)
py -3 shift_calendar_sync.py --once
if errorlevel 1 (
  echo.
  echo SYNC FAILED. Read the error above.
  pause
  exit /b 1
)
echo.
echo SYNC SUCCESS. GitHub data/schedule.json was updated.
pause
