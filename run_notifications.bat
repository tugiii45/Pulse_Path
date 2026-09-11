@echo off
:: Suppresses printing each command to the console as it runs, so this
:: window (or scheduled task log) only shows actual output, not the
:: commands themselves.

:: Change into the project's root folder first. The /d switch lets `cd`
:: also switch drives if needed (not the case here, but harmless to keep).
:: This matters because manage.py must be run from the project directory
:: for Django to find settings.py correctly.
cd /d C:\Users\User\Desktop\Pulse_Path

:: Run the Django management command using the *virtual environment's*
:: python.exe directly (rather than relying on `python` being on PATH
:: or a currently-activated venv). This is what actually makes the venv's
:: installed packages (Django, etc.) available to the script.
:: `process_notifications` is presumably a custom management command
:: (likely in some app's management/commands/ folder) that generates or
:: sends due notifications — this is probably meant to be run on a
:: schedule (e.g. via Windows Task Scheduler).
C:\Users\User\Desktop\Pulse_Path\myenv\Scripts\python.exe manage.py process_notifications

:: Explicitly exit with code 0 (success), regardless of what happened
:: above. Useful for schedulers that check the exit code, but note this
:: means a failure in the python command above won't be reported as a
:: failure here — Task Scheduler will still see this as "succeeded".
exit /b 0