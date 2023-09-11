import axios from 'axios';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AuthProvider as OidcAuthProvider, AuthProviderProps } from 'react-oidc-context';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import { AuthProvider, Footer, Header } from '@components';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

function App({ Component, pageProps }: AppProps) {
  const oidcConfig: AuthProviderProps = {
    authority: `${process.env.NEXT_PUBLIC_KC_URL}/realms/${process.env.NEXT_PUBLIC_KC_REALM}`,
    client_id: `${process.env.NEXT_PUBLIC_KC_CLIENT_ID}`,
    redirect_uri: `${process.env.NEXT_PUBLIC_KC_REDIRECT_URI}`,
    onSigninCallback: async kcUser => {
      if (kcUser) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${kcUser.access_token}`;
      }
    },
  };

  return (
    <OidcAuthProvider {...oidcConfig}>
      <AuthProvider>
        <Head>
          <title>Health Provider Registry for BC’s Emergency Response</title>
          <link rel='icon' href='/assets/img/bc_favicon.ico' />
        </Head>
        <div className='h-full flex flex-col'>
          <Header />
          <main className='flex-grow flex justify-center'>
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </AuthProvider>
      <ToastContainer theme='colored' />
    </OidcAuthProvider>
  );
}

export default App;
