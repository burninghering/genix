import { fetchAirData, fetchOceanData, fetchVesselData } from '../functions/ws_handler.js';

function webSocketHandler(ws) {
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            if (data.data === 'logs') {
                const airData = await fetchAirData();
                const oceanData = await fetchOceanData();
                const vesselData = await fetchVesselData();
                const combinedData = [...airData, ...oceanData, ...vesselData];
                ws.send(JSON.stringify({ data: combinedData }));
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
            ws.send(JSON.stringify({ message: 'Error processing data.' }));
        }
    });
}

module.exports = router; // 라우터 객체 내보내기

export default { webSocketHandler };
