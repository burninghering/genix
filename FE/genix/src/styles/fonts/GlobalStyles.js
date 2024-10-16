import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
 @font-face {
    font-family: 'Pretendard';
    src: url('./Pretendard/Pretendard-Thin.ttf') format('ttf');
    font-weight: 100;
    font-style: normal;
  }
  @font-face {
    font-family: 'Pretendard';
    src: url('./Pretendard/Pretendard-ExtraLight.ttf') format('ttf');
    font-weight: 200;
    font-style: normal;
  }
  @font-face {
    font-family: 'Pretendard';
    src: url('./Pretendard/Pretendard-Light.ttf') format('ttf');
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: 'Pretendard';
    src: url('./Pretendard/Pretendard-Regular.ttf') format('ttf');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Pretendard';
    src: url('./Pretendard/Pretendard-Medium.ttf') format('ttf');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Pretendard';
    src: url('./Pretendard/Pretendard-SemiBold.ttf') format('ttf');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Pretendard';
    src: url('./Pretendard/Pretendard-Bold.ttf') format('ttf');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Pretendard';
    src: url('./Pretendard/Pretendard-ExtraBold.ttf') format('ttf');
    font-weight: 800;
    font-style: normal;
  }
  @font-face {
    font-family: 'Pretendard';
    src: url('./Pretendard/Pretendard-Black.ttf') format('ttf');
    font-weight: 900;
    font-style: normal;
  }

  body {
    font-family: 'Pretendard', sans-serif;
    margin: 0;
    padding: 0;
  }

  @font-face {
    font-family: 'Inter';
    src: url('./Inter/Inter-Thin.ttf') format('ttf');
    font-weight: 100;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url('./Inter/Inter-ExtraLight.ttf') format('ttf');
    font-weight: 200;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url('./Inter/Inter-Light.ttf') format('ttf');
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url('./Inter/Inter-Regular.ttf') format('ttf');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url('./Inter/Inter-Medium.ttf') format('ttf');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url('./Inter/Inter-SemiBold.ttf') format('ttf');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url('./Inter/Inter-Bold.ttf') format('ttf');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url('./Inter/Inter-ExtraBold.ttf') format('ttf');
    font-weight: 800;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url('./Inter/Inter-Black.ttf') format('ttf');
    font-weight: 900;
    font-style: normal;
  }
  
  body {
    font-family: 'Pretendard', 'Inter', sans-serif;
    margin: 0;
    padding: 0;
  }
`;

export default GlobalStyles;