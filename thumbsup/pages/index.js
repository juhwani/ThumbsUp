import Head from "next/head";
import Main from "../components/Main.jsx";
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const HomeContent = styled.div`
  padding: 2rem;
  text-align: center;
`;

const WelcomeMessage = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

export default function Home() {
  const { currentUser } = useAuth();
  
  return (
    <>
      <Head>
        <title>Ride Sharing App</title>
        <meta name="description" content="Find and share rides easily" />
      </Head>
      
      <Main>
        <HomeContent>
          {currentUser ? (
            <WelcomeMessage>
              Welcome back, {currentUser.email}!
            </WelcomeMessage>
          ) : (
            <WelcomeMessage>
              Welcome to the Ride Sharing App
            </WelcomeMessage>
          )}
          <p>Find your next ride or offer one to others.</p>
        </HomeContent>
      </Main>
    </>
  );
}