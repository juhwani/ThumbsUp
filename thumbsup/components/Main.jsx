import React from 'react';
import styled from 'styled-components';
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import Welcome from "./Welcome.jsx";

const MainContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 0;
`;

export default function Main() {
    return (
        <MainContainer>
            <Navbar/>
            <Welcome/>
            <Footer/>
        </MainContainer>
    );
}