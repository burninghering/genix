#!/bin/bash

# 애플리케이션 이름
APP_NAME="netro_genix"

# 무한 루프로 애플리케이션 상태 모니터링
while true; do
  # 포트 8082 사용 중인 프로세스 종료
  PORT=8082
  PID=$(netstat -tuln | grep ":$PORT" | awk '{print $7}' | cut -d'/' -f1)
  if [ -n "$PID" ]; then
    echo "Killing process on port $PORT (PID: $PID)"
    kill -9 "$PID"
  fi

  # 프로젝트 경로로 이동
  cd "/home/ubuntu/GENIX_Node/BE/netro_genix/" || exit

  # 8GB 힙 메모리로 애플리케이션 실행
  echo "Starting $APP_NAME with 8GB heap memory..."
  NODE_OPTIONS="--max-old-space-size=8192" npm start

  echo "$APP_NAME crashed. Restarting..."
  sleep 2
done
