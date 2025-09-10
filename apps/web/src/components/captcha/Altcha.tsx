import { useEffect, useRef } from 'react';
import 'altcha/altcha.css';

interface AltchaProps {
  onVerify: (isValid: boolean) => void;
}

const Altcha = ({ onVerify }: AltchaProps) => {
  const widgetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleStateChange = (ev: Event | CustomEvent) => {
      if ('detail' in ev) {
        if (ev?.detail?.state === 'verified') {
          onVerify(true);
        }
      }
    };

    const { current } = widgetRef;
    if (current) {
      import('altcha').then(() => {
        current.addEventListener('statechange', handleStateChange);
      });
      return () => {
        current.removeEventListener('statechange', handleStateChange);
      };
    }
  }, [onVerify]);

  /* Configure your `challengeurl` and remove the `test` attribute, see docs: https://altcha.org/docs/website-integration/#using-altcha-widget  */
  return (
    // @ts-expect-error: altcha-widget is not recognized
    <altcha-widget
      ref={widgetRef}
      style={
        {
          '--altcha-max-width': '100%',
        } as React.CSSProperties
      }
      challengeurl={`${process.env.NEXT_PUBLIC_API_URL}/captcha`}
      // TODO: Fix this unrecognized error
      // @ts-expect-error: altcha-widget is not recognized
    ></altcha-widget>
  );
};

Altcha.displayName = 'Altcha';

export { Altcha };
