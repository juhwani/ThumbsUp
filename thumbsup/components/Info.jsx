import React from 'react';
import styled from 'styled-components';
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Welcome from "./Welcome.jsx";

const MainContainer = styled.div`
    width: 70%;
    height: 70%;
    bottom: 10vh;
    position: absolute;
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    padding: 2rem;
    z-index: 100;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    &:hover {
        color: #ff5555;
    }
`;

const RideTitle = styled.h1`
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.8rem;
`;

const RideDetail = styled.div`
    margin-bottom: 1rem;
`;

const DetailLabel = styled.span`
    font-weight: bold;
    color: #555;
`;

const DetailValue = styled.span`
    margin-left: 0.5rem;
`;

const PriceTag = styled.div`
    display: inline-block;
    background-color: #e7f5ff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: bold;
    color: #0077cc;
    margin: 1rem 0;
`;

const Description = styled.div`
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #f8f8f8;
    border-radius: 4px;
    border-left: 4px solid #ddd;
`;

export default function Info({ ride, onClick }) {
    return (
        <MainContainer>
            <CloseButton onClick={onClick}>×</CloseButton>
            
            <RideTitle>
                {ride.departureLocation} → {ride.destination}
            </RideTitle>
            
            <RideDetail>
                <DetailLabel>Departure Date:</DetailLabel>
                <DetailValue>{ride.departureDate}</DetailValue>
            </RideDetail>
            
            <RideDetail>
                <DetailLabel>Departure Time:</DetailLabel>
                <DetailValue>{ride.departureTime}</DetailValue>
            </RideDetail>
            
            <RideDetail>
                <DetailLabel>Available Seats:</DetailLabel>
                <DetailValue>{ride.seats}</DetailValue>
            </RideDetail>
            
            <PriceTag>${ride.price}</PriceTag>
            
            <Description>
                <DetailLabel>Description:</DetailLabel>
                <p>{ride.description || "No additional information provided."}</p>
            </Description>
            
            <button 
                style={{
                    marginTop: 'auto',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Book This Ride
            </button>
        </MainContainer>
    );
}