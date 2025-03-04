import { AuthProvider } from '@/context/AuthContext.js';
export default function App({ Component, pageProps }) {
  return <AuthProvider><Component {...pageProps} /></AuthProvider>;
}
