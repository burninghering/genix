import React from "react";
import styled, { keyframes } from "styled-components";

const ModalBackground = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 반투명한 검정 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 모달보다 위에 위치 */
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
`;

const LoaderWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const LoaderDot = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.8vmax;
  height: 0.8vmax;
  border-radius: 50%;
  background-color: rgba(86, 180, 255, ${({ opacity }) => opacity});
  transform: translate(-50%, -50%) rotate(0deg) translate(50px) rotate(0deg);
  transform-origin: 50% -1.5vmax; /* 회전 중심을 점 외부로 설정 */
  animation: ${spin} 1.7s infinite ${({ timing }) => timing};
  animation-delay: ${({ delay }) => delay}s;
`;

const LoadingModal = () => (
  <ModalBackground>
    <LoaderWrapper>
      <LoaderDot opacity={1} delay={0} timing="ease-in-out" />
      <LoaderDot opacity={0.8} delay={0.15} timing="ease-in-out" />
      <LoaderDot opacity={0.6} delay={0.3} timing="ease-in-out" />
      <LoaderDot opacity={0.4} delay={0.45} timing="ease-in-out" />
      <LoaderDot opacity={0.2} delay={0.6} timing="ease-in-out" />
    </LoaderWrapper>
  </ModalBackground>
);

export default LoadingModal;