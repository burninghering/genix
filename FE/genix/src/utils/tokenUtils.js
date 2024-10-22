import Instance from "../Variable/Instance.js";

const URL = Instance.SVR_URL;

const getTokenFromLocal = async () => {
    try {
        const value = await localStorage.getItem("Tokens");
        if (value !== null) {
            return JSON.parse(value);
        } else {
            return null;
        }
    } catch (e) {
        console.log(e.message);
        return null;
    }
};

export const verifyTokens = async (navigate) => {
    try {
        const Token = await getTokenFromLocal();

        // 최초 접속
        if (Token === null) {
            console.log(`Token === null`);
            navigate("/");
            return;
        }
        console.log('id',Token.UserID);
        // 로컬 스토리지에 Token 데이터가 있으면 -> 토큰들을 헤더에 넣어 검증
        const headers_config=
        {
            "RefreshToken": Token.RefreshToken,
            "AccessToken": Token.AccessToken,
            // "ID": Token.UserID,
        };

        console.log(`RefreshToken : ${Token.RefreshToken} / AccessToken${Token.AccessToken}`);
        const response = await fetch(`${URL}/login/refresh`, {
            method: "post",
            headers: headers_config,
        });
        //console.log(`response.status : ${response.status}`);
        if (response.status === 401) {
            console.log(`222`);
            navigate("/");
        } else {
            const newAccessToken = response.headers.get('AccessToken');
            localStorage.setItem('Tokens', JSON.stringify({
                ...Token,
                'AccessToken': newAccessToken,
            }));
            // console.log(`acc : `, response.headers);
            // console.log(`ref : ${response.headers.get('RefreshToken')}`);

            // localStorage.setItem('Tokens', JSON.stringify({
            //     'AccessToken': response.headers.get('AccessToken'),
            //     'RefreshToken': response.headers.get('RefreshToken'),
            //     'UserID': response.headers.get('UserID')
            //   }))
            console.log(`만료되지않음.`);

            navigate("/Device");
        }
    } catch (error) {
        console.error("Error in verifyTokens:", error);
    }
};
