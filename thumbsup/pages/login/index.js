import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styled from 'styled-components';
import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../backend/config.js';
import Link from 'next/link';
import { useRouter } from 'next/router';

const LinkText = styled.p`
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    
    a {
        color: #007bff;
        text-decoration: none;
        
        &:hover {
            text-decoration: underline;
        }
    }
`;
const MainContainer = styled.div`
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: row;
    background-color: yellow;
`;

const Left = styled.div`
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    background-color: #424242  ;
    justify-content: center;
    align-items: center;
`;

const LoginBox = styled.div`
    background-color: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 80%;
    max-width: 400px;
`;

const LoginForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #333;
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    outline: none;
    
    &:focus {
        border-color: #007bff;
    }
`;

const LoginButton = styled.button`
    background-color: #81C784;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        background-color: #4CAF50;
    }
`;

const ErrorMessage = styled.div`
    color: red;
    font-size: 14px;
    margin-top: 10px;
`;

const Right = styled.div`
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    background-color: #81c784;
    justify-content: center;
    align-items: center;
    font-size: 80px;
    color: black;
`;


export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // debug log 
        console.log('Attempting login with:', { email, password });

        try {
            if (!auth) {
                console.error('Auth instance not initialized');
                setError('Authentication service not initialized');
                return;
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential);
            router.push('/');
        } catch (error) {
            console.error('Login error:', error.code, error.message);
            
            // more specific error handling so that I don't have a headache looking for what's going on
            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    setError('Invalid email or password');
                    break;
                case 'auth/invalid-email':
                    setError('Please enter a valid email address');
                    break;
                case 'auth/user-disabled':
                    setError('This account has been disabled');
                    break;
                case 'auth/network-request-failed':
                    setError('Network error');
                    break;
                default:
                    setError('An error occurred during login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainContainer>
            <Left>
                <LoginBox>
                    <LoginForm onSubmit={handleSubmit}>
                        <InputGroup>
                            <Label>Email</Label>
                            <Input 
                                type="email" 
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.trim())}
                                required
                            />
                        </InputGroup>
                        <InputGroup>
                            <Label>Password</Label>
                            <Input 
                                type="password" 
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </InputGroup>
                        {error && (
                            <ErrorMessage>
                                {error}
                                {(error.includes('Invalid email or password') || error.includes('user not found')) && (
                                    <div>
                                        <p>Don't have an account? <Link href="/register">Register here</Link></p>
                                    </div>
                                )}
                            </ErrorMessage>
                        )}
                        <LoginButton 
                            type="submit" 
                            disabled={loading || !email || !password}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </LoginButton>
                    </LoginForm>
                </LoginBox>
            </Left>
            <Right>ThumbsUp 👍</Right>
        </MainContainer>
    );
}