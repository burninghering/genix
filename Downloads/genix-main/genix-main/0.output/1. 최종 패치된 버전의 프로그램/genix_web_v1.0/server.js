const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const helmet = require('helmet'); // 보안 관련 미들웨어
const app = express();
const cors = require('cors'); // CORS 미들웨어

const port = process.env.PORT || 443;

// SSL 인증서와 키 파일 읽기
const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.crt', 'utf8');
const csr = fs.readFileSync('server.csr', 'utf8');
const credentials = { key: privateKey, cert: certificate, ca: csr };

// CORS 설정
const corsOptions = {
    origin: 'https://192.168.0.231', // 허용할 출처를 설정합니다.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 쿠키나 인증 정보를 포함하려면 true로 설정
};
app.use(cors(corsOptions));

// HTTP에서 HTTPS로 리다이렉트 미들웨어
const redirectHttpToHttps = (req, res, next) => {
    if (req.secure) {
        return next();
    }
    res.redirect(`https://${req.headers.host}${req.url}`);
};

// Helmet으로 보안 헤더 설정
app.use(helmet());

// COOP 및 COEP 헤더 설정
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});

// HTTP에서 HTTPS로 리다이렉트
app.use(redirectHttpToHttps);
// Content Security Policy 설정
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            //   scriptSrc: ["'self'"],// "https://192.168.0.231:3000"], // 필요한 CDN 추가
            //   styleSrc: ["'self'"], //"https://192.168.0.231:3000"],
            imgSrc: ["'self'", "data:"], // 데이터 URL 및 필요한 이미지 도메인 추가
            connectSrc: [
                "'self'",
                "https://192.168.0.231:3000", // API 서버의 IP 주소와 포트 추가
                "wss://192.168.0.231:3000" // WebSocket 서버의 IP 주소와 포트 추가
            ],
            fontSrc: ["'self'"],// "https://fonts.googleapis.com"], // 필요한 폰트 도메인 추가
            frameSrc: ["'none'"], // iframe 제한
        },
    })
);

// HSTS 헤더 설정
app.use(helmet.hsts({
    maxAge: 31536000, // 1년
    includeSubDomains: true,
    preload: true
}));

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// HTTPS 서버 생성
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
    console.log(`HTTPS Server is running on port ${port}`);
});

// HTTP 서버 생성 및 HTTPS로 리다이렉트
const httpServer = http.createServer(app);
httpServer.listen(80, () => {
    console.log('HTTP Server is running on port 80 and redirecting to HTTPS');
});