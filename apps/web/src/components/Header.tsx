import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

import logo from '@assets/img/bc_logo.png';
import { Logout } from './Logout';
import { useAuthContext } from './AuthProvider';

export const Header: React.FC = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headerRef?.current?.focus();
  }, [router.asPath]);

  return (
    <header className='w-full py-2 border-b-2 bg-bc-blue-primary border-bc-yellow-primary flex justify-center'>
      <div className='w-full 2xl:w-2/3 h-full flex flex-row items-center align-center justify-between px-2 md:px-12'>
        <div className='layout-grid gap-0 h-full flex flex-row items-center align-center'>
          <Link href='/' passHref>
            <img src={logo.src} alt='government of british columbia' width={160} height={45} />
          </Link>
          <div className='ml-7 pl-7 border-l-2 border-bc-yellow-primary'>
            <h1
              tabIndex={-1}
              ref={headerRef}
              className=' font-semibold tracking-wider text-white lg:text-xl md:text-xl text-sm focus:outline-hidden'
            >
              BC Emergency Response
            </h1>
          </div>
        </div>
        <div className='flex flex-row align-middle'>
          {user && <span className='text-white m-auto mr-4'>{user.name}</span>}
          <Logout />
        </div>
      </div>
    </header>
  );
};
