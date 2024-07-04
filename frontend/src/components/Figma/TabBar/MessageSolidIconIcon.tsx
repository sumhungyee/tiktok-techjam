import { memo, SVGProps } from 'react';

const MessageSolidIconIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg preserveAspectRatio='none' viewBox='0 0 21 21' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M0.5 2C0.5 0.895431 1.39543 0 2.5 0H18.5C19.6046 0 20.5 0.89543 20.5 2V15C20.5 16.1046 19.6046 17 18.5 17H13.9599L11.2621 20.1759C10.8628 20.6461 10.1372 20.6461 9.73785 20.1759L7.04007 17H2.5C1.39543 17 0.5 16.1046 0.5 15V2ZM6.5 8.5C6.5 8.22386 6.72386 8 7 8H14C14.2761 8 14.5 8.22386 14.5 8.5V9.5C14.5 9.77614 14.2761 10 14 10H7C6.72386 10 6.5 9.77614 6.5 9.5V8.5Z'
      fill='#8A8B8F'
    />
  </svg>
);

const Memo = memo(MessageSolidIconIcon);
export { Memo as MessageSolidIconIcon };
