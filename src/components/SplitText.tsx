import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | string;
  from?: Record<string, any>;
  to?: Record<string, any>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify' | string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | string;
  onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text = '',
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '0px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    let active = true;
    if (document.fonts?.status === 'loaded') {
      setFontsLoaded(true);
    } else if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (active) setFontsLoaded(true);
        })
        .catch(() => {
          if (active) setFontsLoaded(true);
        });
      const timer = setTimeout(() => {
        if (active) setFontsLoaded(true);
      }, 50);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setFontsLoaded(true);
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      if (animationCompletedRef.current) return;
      const el = ref.current;

      let targets: NodeListOf<Element> | Element[] = [];
      if (splitType.includes('chars')) {
        targets = el.querySelectorAll('.split-char');
      }
      if (!targets.length && splitType.includes('words')) {
        targets = el.querySelectorAll('.split-word');
      }
      if (!targets.length) {
        targets = el.querySelectorAll('.split-char, .split-word');
      }

      if (!targets.length) return;

      const rect = el.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;

      const animProps = {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        onComplete: () => {
          animationCompletedRef.current = true;
          onCompleteRef.current?.();
        },
        willChange: 'transform, opacity',
        force3D: true
      };

      let tween: gsap.core.Tween;

      if (inViewport) {
        tween = gsap.fromTo(targets, { ...from }, animProps);
      } else {
        const startPct = (1 - threshold) * 100;
        const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
        const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
        const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
        const sign =
          marginValue === 0
            ? ''
            : marginValue < 0
              ? `-=${Math.abs(marginValue)}${marginUnit}`
              : `+=${marginValue}${marginUnit}`;

        const start = `top ${startPct}%${sign}`;

        tween = gsap.fromTo(targets, { ...from }, {
          ...animProps,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
            fastScrollEnd: true,
            anticipatePin: 0.4
          }
        });
      }

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
        tween.kill();
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded
      ],
      scope: ref
    }
  );

  const Tag = (tag || 'p') as any;

  const isGradient =
    className.includes('bg-clip-text') ||
    className.includes('text-transparent') ||
    className.includes('bg-gradient');

  const parentStyle: React.CSSProperties = {
    textAlign: textAlign as any,
    wordWrap: 'break-word'
  };

  const itemStyle: React.CSSProperties = isGradient
    ? {
        display: 'inline-block',
        background: 'inherit',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent'
      }
    : {
        display: 'inline-block'
      };

  const words = text.split(' ');

  return (
    <Tag ref={ref} style={parentStyle} className={`split-parent ${className}`}>
      {words.map((word, wordIdx) => (
        <React.Fragment key={wordIdx}>
          <span className="split-word" style={itemStyle}>
            {splitType.includes('chars')
              ? word.split('').map((char, charIdx) => (
                  <span key={charIdx} className="split-char" style={itemStyle}>
                    {char}
                  </span>
                ))
              : word}
          </span>
          {wordIdx < words.length - 1 && (
            <span className="split-space inline-block" style={itemStyle}>
              &nbsp;
            </span>
          )}
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default SplitText;
