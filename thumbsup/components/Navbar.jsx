import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from "next/link";
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../backend/config';

const NavbarContainer = styled.nav`
  height: 64px;
  width: 96%;
  background-color: #2e7d32;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const NavBrand = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavItem = styled.div`
  font-size: 1rem;
  font-weight: 500;
  position: relative;
  
  a {
    text-decoration: none;
    color: rgba(255, 255, 255, 0.85);
    transition: color 0.2s ease;
    padding: 0.5rem 0;
    display: block;
    
    &:hover {
      color: white;
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: #81c784;
      transition: width 0.3s ease;
    }
    
    &:hover::after {
      width: 100%;
    }
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
`;

const UserEmail = styled.span`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
`;

const LogoutButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const LoginButton = styled(NavItem)`
  a {
    background-color: #43a047;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #388e3c;
    }
    
    &::after {
      display: none;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background-color: #2e7d32;
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    ${NavItem} {
      margin: 0.5rem 0;
      
      a::after {
        display: none;
      }
    }
  }
`;

export default function Navbar() {
    const { currentUser, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);
    
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // auth context will handle redirect
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    
    return (
        <NavbarContainer style={scrolled ? { height: '56px', backgroundColor: 'rgba(46, 125, 50, 0.95)' } : {}}>
            <NavBrand>ThumbsUp</NavBrand>
            
            <MobileMenuButton onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? '✕' : '☰'}
            </MobileMenuButton>
            
            <NavLinks className="desktop-menu" style={{ display: 'flex', '@media (max-width: 768px)': { display: 'none' } }}>
                <NavItem><Link href="/">Home</Link></NavItem>
                <NavItem><Link href="/rides">Find Rides</Link></NavItem>
                
                {currentUser && (
                    <NavItem><Link href="/create">Post Rides</Link></NavItem>
                )}
                
                {currentUser && (
                    <NavItem><Link href="/profile">Profile</Link></NavItem>
                )}
            </NavLinks>
            
            <AuthSection>
                {loading ? (
                    <NavItem>Loading...</NavItem>
                ) : currentUser ? (
                    <UserInfoContainer>
                        <UserEmail>{currentUser.email.split('@')[0]}</UserEmail>
                        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
                    </UserInfoContainer>
                ) : (
                    <LoginButton><Link href="/login">Login</Link></LoginButton>
                )}
            </AuthSection>
            
            <MobileMenu isOpen={isMobileMenuOpen}>
                <NavItem><Link href="/">Home</Link></NavItem>
                <NavItem><Link href="/rides">Find Rides</Link></NavItem>
                
                {currentUser && (
                    <NavItem><Link href="/create">Post Rides</Link></NavItem>
                )}
                
                {currentUser && (
                    <NavItem><Link href="/profile">Profile</Link></NavItem>
                )}
                
                {currentUser && (
                    <UserInfoContainer style={{ margin: '0.5rem 0' }}>
                        <UserEmail>{currentUser.email}</UserEmail>
                        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
                    </UserInfoContainer>
                )}
            </MobileMenu>
        </NavbarContainer>
    );
}