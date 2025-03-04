import styled from 'styled-components';

const FooterContainer = styled.footer`
  min-height: 200px; 
  width: 100%; 
  padding: 2rem 0rem; 
  background-color: #1a1a1a;
  color: #ffffff;
`;

const FooterContent = styled.div`
  max-width: 1200px; 
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

const FooterSection = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 2rem;
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px; 
`;

const FooterLink = styled.a`
  color: #ffffff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Copyright = styled.div`
  padding-top: 1rem;
  border-top: 1px solid #333;
  text-align: center;
  font-size: 0.875rem;
`;

const Footer = () => {
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterColumn>
            <h3>Company</h3>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterColumn>
          
          <FooterColumn>
            <h3>Connect</h3>
            <FooterLink href="https://twitter.com">Twitter</FooterLink>
            <FooterLink href="https://linkedin.com">LinkedIn</FooterLink>
            <FooterLink href="https://instagram.com">Instagram</FooterLink>
          </FooterColumn>
        </FooterSection>

        <Copyright>
          © 2025 ThumbsUp. All rights reserved.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;