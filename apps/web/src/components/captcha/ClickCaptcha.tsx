import React, { useState, useEffect } from 'react';

interface ClickCaptchaProps {
  onVerify: (isValid: boolean) => void;
}

export const ClickCaptcha: React.FC<ClickCaptchaProps> = ({ onVerify }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasMovedMouse, setHasMovedMouse] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleMouseMove = () => {
    setHasMovedMouse(true);
  };

  const handleVerifyClick = () => {
    const elapsedTime = Date.now() - startTime;

    // Basic bot check: Ensure some time has passed and mouse moved
    if (elapsedTime < 500 || !hasMovedMouse) {
      alert('Suspicious activity detected. Try again.');
      return;
    }

    setIsLoading(true);

    // Simulate verification delay
    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
      onVerify(true); // Notify the parent component of successful verification
    }, 1000);
  };

  return (
    <div
      className='flex items-center gap-2 p-4 bg-gray-100 rounded-md shadow-md'
      onMouseMove={handleMouseMove}
    >
      <button
        type='button'
        onClick={handleVerifyClick}
        className={`flex items-center justify-center w-6 h-6 border-2 rounded focus:outline-none ${
          isVerified ? 'border-green-500 bg-green-500' : 'border-gray-400'
        }`}
        disabled={isVerified || isLoading}
      >
        {isVerified ? (
          <span className='text-white font-bold'>✔</span>
        ) : isLoading ? (
          <div className='loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-4 w-4 animate-spin'></div>
        ) : null}
      </button>
      <span className='text-gray-700'>
        {isVerified ? 'Verified' : isLoading ? 'Verifying...' : "Click to verify I'm not a robot"}
      </span>
    </div>
  );
};
