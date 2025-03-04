import react from 'react'
import styled from 'styled-components' 
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
const MainContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 0;
`;
const ContentContainer = styled.div`
    width: 100%;
    min-height: 50vh;
    background-color: white;
    color: black;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
`
const Welcomeheader = styled.div`
    min-width: 1px;
    min-height: 1vh;
    color: black;
    font-size: 100px;
    margin-top: 20vh;
    margin-bottom: 1vh;
`
const Welcomeparagraph = styled.div`
    max-width: 53vw;
    min-height: 10vh;
    color: black;
    font-size: 20px;
    margin-bottom: 30vh;
`


export default function Welcome() {
    return (
        <ContentContainer>
            <Welcomeheader>Welcome to ThumbsUp!</Welcomeheader>
            <Welcomeparagraph>
            ThumbsUp connects riders with drivers heading the same way, making commuting cheaper and greener. 
            Save more than Uber by sharing rides at fair prices while reducing carbon emissions. 
            Smart, affordable, and eco-friendly—ride better with ThumbsUp.
            </Welcomeparagraph>
        </ContentContainer>
    )
}
