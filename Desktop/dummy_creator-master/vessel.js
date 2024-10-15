let vesselState = {};

function formatDateToYYYYMMDDHHMMSS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function generateRandomOffset() {
    return (Math.random() - 0.5) * 0.02; // 소량의 무작위 오프셋 추가
}

function generateDummyVesselData(devId) {
    let currentDate = new Date();

    if (!vesselState[devId]) {
        vesselState[devId] = {
            lati: 35.995 + generateRandomOffset(), // 초기 위치를 무작위 오프셋으로 설정
            longi: 129.564 + generateRandomOffset(),
            speed: 2 + Math.random() * 10,
            course: Math.floor(Math.random() * 360),
        };
    }

    let state = vesselState[devId];
    const speedFactor = state.speed / 1000;
    state.lati += speedFactor * Math.cos((state.course * Math.PI) / 180);
    state.longi += speedFactor * Math.sin((state.course * Math.PI) / 180);

    state.speed += (Math.random() * 2 - 1);
    state.speed = Math.max(2, Math.min(12, state.speed));
    state.course += (Math.random() * 10 - 5); 
    state.course = (state.course + 360) % 360;

    return {
        type: 'vessel',
        id: devId,
        log_datetime: formatDateToYYYYMMDDHHMMSS(currentDate),
        rcv_datetime: formatDateToYYYYMMDDHHMMSS(currentDate),
        lati: state.lati.toFixed(3),
        longi: state.longi.toFixed(3),
        speed: state.speed.toFixed(2),
        course: state.course.toFixed(0),
        azimuth: (50 + Math.floor(Math.random() * 10)).toFixed(0)
    };
}

function generateMultipleVessels(numVessels) {
    const vessels = [];
    for (let i = 1; i <= numVessels; i++) {
        vessels.push(generateDummyVesselData(i));
    }
    return vessels;
}

const vessels = generateMultipleVessels(50);
console.log(vessels);
