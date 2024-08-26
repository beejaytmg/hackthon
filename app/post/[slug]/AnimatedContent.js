'use client'

import { useSpring, animated } from 'react-spring';

export default function AnimatedContent({ children }) {
  const props = useSpring({
    from: { opacity: 0, transform: 'translate3d(0,40px,0)' },
    to: { opacity: 1, transform: 'translate3d(0,0px,0)' },
    config: { mass: 1, tension: 120, friction: 14 },
  });

  return <animated.div style={props}>{children}</animated.div>;
}