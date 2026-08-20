@echo off
cd /d "%~dp0"
if not exist .venv (
  py -m venv .venv
  call .venv\Scripts\python.exe -m pip install -r requirements.txt
)
call .venv\Scripts\python.exe shift_calendar_sync.py
pause
