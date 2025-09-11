import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { ReactNode } from 'react';

type AlertProps = {
  color?: 'blue' | 'yellow' | 'red';
  children: ReactNode;
};

export const Alert = ({ color, children }: AlertProps) => {
  let containerClasses = '';
  const baseClasses = 'py-4 text-left flex items-center rounded-sm';

  switch (color) {
    case 'red':
      containerClasses = classNames(baseClasses, 'bg-bc-red-error');
      break;
    case 'yellow':
      containerClasses = classNames(baseClasses, 'bg-bc-yellow-cream');
      break;
    default:
      containerClasses = classNames(baseClasses, 'bg-bc-light-blue-background');
  }

  return (
    <div className={containerClasses}>
      <div className='px-5 text-bc-blue-primary'>
        <FontAwesomeIcon className='h-6' icon={faExclamationCircle}></FontAwesomeIcon>
      </div>
      <div className='text-bc-blue-primary'>{children}</div>
    </div>
  );
};
