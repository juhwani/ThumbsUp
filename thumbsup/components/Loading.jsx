import React from 'react';
import styled from 'styled-components';

// Styled components for the overlay
const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Spinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: white;
  margin-top: 20px;
  font-size: 18px;
`;

const LoadingOverlay = ({ message = "Processing..." }) => {
  return (
    <OverlayContainer>
      <div style={{ textAlign: 'center' }}>
        <Spinner />
        <LoadingText>{message}</LoadingText>
      </div>
    </OverlayContainer>
  );
};

export default LoadingOverlay;