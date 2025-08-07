import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';

export interface ButtonProps {
  onClick?: () => void;
  variant: keyof typeof buttonColor;
  loading?: boolean;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  tabIndex?: -1 | 0;
  children: ReactNode;
}

export const buttonColor: Record<string, string> = {
  primary: `border-transparent bg-bc-blue-primary text-white hover:bg-blue-800 focus:ring-blue-500`,
  secondary: `border-2 border-bc-blue-primary bg-white text-bc-blue-primary hover:bg-gray-100 focus:ring-blue-500`,
  outline: `border border-gray-400 bg-white hover:bg-gray-100 focus:ring-blue-500`,
};

export const buttonBase = `w-auto inline-flex justify-center items-center rounded 
  shadow-xs px-4 py-2 text-base font-bold focus:outline-hidden
  disabled:opacity-50
  focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:text-sm`;

export const Button: React.FC<ButtonProps> = props => {
  const { variant, type, children, disabled, loading, onClick, tabIndex } = props;

  return (
    <button
      tabIndex={tabIndex ? tabIndex : 0}
      onClick={onClick}
      type={type}
      className={`
        ${buttonColor[variant]}
        ${variant !== 'link' ? buttonBase : ''}
      `}
      disabled={disabled}
    >
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} className='h-5 w-5 animate-spin anim' />
      ) : (
        children
      )}
    </button>
  );
};
