@echo off

REM 애플리케이션 이름
set APP_NAME=netro_genix

REM 포트 8082 사용 중인 프로세스 종료
set PORT=8082
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT%') do (
    if "%%a" neq "" (
        echo Killing process on port %PORT% (PID: %%a)
        taskkill /PID %%a /F
    )
    goto endProcessKill
)
:endProcessKill

REM 포트 9000 사용 중인 프로세스 종료
set PORT=9000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT%') do (
    echo Killing process on port %PORT% (PID: %%a)
    taskkill /PID %%a /F
    goto endProcessKill2
)
:endProcessKill2

REM 프로젝트 경로로 이동
cd "C:\Users\NETRO\Documents\Netro_GENIX_Node\BE\netro_genix"

REM 8GB 힙 메모리로 애플리케이션 실행 (별도의 터미널에서 실행)
echo Starting %APP_NAME% with 8GB heap memory...
start "Node App" cmd /c "set NODE_OPTIONS=--max-old-space-size=8192 && npm start"

REM 3초 대기 후 추가 JS 파일 실행 (각각 다른 터미널에서 실행)
timeout /t 3 /nobreak >nul
echo Running dummy_client...
start "Dummy Client" cmd /k "cd C:\Users\NETRO\Documents\Netro_GENIX_Node\BE\netro_genix\functions && node dummy_client.js"

REM 3초 대기 후 다음 스크립트 실행
timeout /t 3 /nobreak >nul
echo Running dummy_server...
start "Dummy Server" cmd /k "cd C:\Users\NETRO\Documents\Netro_GENIX_DummyCreator && node dummy_server.js"

REM 3초 대기 후 다음 스크립트 실행
timeout /t 3 /nobreak >nul
echo Running dummy_client_vessel...
start "Dummy Client Vessel" cmd /k "cd C:\Users\NETRO\Documents\Netro_GENIX_Node\BE\netro_genix\functions && node dummy_client_vessel.js"

REM 3초 대기 후 다음 스크립트 실행
timeout /t 3 /nobreak >nul
echo Running dummy_server_vessel...
start "Dummy Server Vessel" cmd /k "cd C:\Users\NETRO\Documents\Netro_GENIX_DummyCreator && node dummy_server_vessel.js"

echo All processes started successfully.
