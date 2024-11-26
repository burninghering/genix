@echo off

REM 애플리케이션 이름
set APP_NAME=netro_genix

REM 종료할 포트 목록 설정
set PORTS=8082 9000

REM 포트 사용 중인 프로세스 종료
for %%P in (%PORTS%) do (
    set PORT=%%P
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT%') do (
        if "%%a" neq "" (
            echo Killing process on port %PORT% (PID: %%a)
            taskkill /PID %%a /F
        )
    )
)

REM 종료할 프로그램 이름 목록 설정
set PROGRAMS="Node App" "Dummy Client" "Dummy Server" "Dummy Client Vessel" "Dummy Server Vessel"

REM 각 프로그램 종료
for %%P in (%PROGRAMS%) do (
    echo Terminating program: %%P
    taskkill /FI "WINDOWTITLE eq %%P" /F
)

echo All specified processes have been terminated.
