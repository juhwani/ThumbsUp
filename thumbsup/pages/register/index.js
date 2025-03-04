import { useState } from 'react';
import styled from 'styled-components';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
    background-color: gray;
    justify-content: center;
    align-items: center;
`;

const RegisterBox = styled.div`
    background-color: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 80%;
    max-width: 400px;
`;

const RegisterForm = styled.form`
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

const RegisterButton = styled.button`
    background-color: #007bff;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #0056b3;
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
    background-color: lightgreen;
    justify-content: center;
    align-items: center;
    font-size: 80px;
    color: black;
`;

export default function Register() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password should be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Registered user:', user);
            router.push('/login');   // redirect to login page after registration
        } catch (error) {
            console.error('Error:', error);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError('This email is already registered. Please login instead.');
                    break;
                case 'auth/invalid-email':
                    setError('Please enter a valid email address.');
                    break;
                default:
                    setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainContainer>
            <Left>
                <RegisterBox>
                    <RegisterForm onSubmit={handleSubmit}>
                        <InputGroup>
                            <Label>Email</Label>
                            <Input 
                                type="email" 
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </InputGroup>
                        <InputGroup>
                            <Label>Password</Label>
                            <Input 
                                type="password" 
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </InputGroup>
                        <InputGroup>
                            <Label>Confirm Password</Label>
                            <Input 
                                type="password" 
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </InputGroup>
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                        <RegisterButton 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </RegisterButton>
                        <LinkText>
                            Already have an account? <Link href="/login">Log in</Link>
                        </LinkText>
                    </RegisterForm>
                </RegisterBox>
            </Left>
            <Right>Welcome! 👋</Right>
        </MainContainer>
    );
}