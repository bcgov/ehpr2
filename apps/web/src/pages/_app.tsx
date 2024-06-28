import axios from 'axios';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { AuthProvider as OidcAuthProvider, AuthProviderProps } from 'react-oidc-context';
import { ToastContainer } from 'react-toastify';
import { config } from '@fortawesome/fontawesome-svg-core';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { AuthProvider, Footer, Header } from '@components';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

function App({ Component, pageProps }: AppProps) {
  // turn off auto adding of css for font awesome icons (svg), CSP complains about inline styles
  config.autoAddCss = false;

  const oidcConfig: AuthProviderProps = {
    authority: `${process.env.NEXT_PUBLIC_KC_URL}/realms/${process.env.NEXT_PUBLIC_KC_REALM}`,
    client_id: `${process.env.NEXT_PUBLIC_KC_CLIENT_ID}`,
    redirect_uri: `${process.env.NEXT_PUBLIC_KC_REDIRECT_URI}`,
    client_secret: `${process.env.NEXT_PUBLIC_KC_SECRET}`,
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
          <main className='grow flex justify-center'>
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
