import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface TrailDot {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export const CustomCursor: React.FC = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const ringX = useSpring(cursorX, { damping: 20, stiffness: 300, mass: 0.1 });
  const ringY = useSpring(cursorY, { damping: 20, stiffness: 300, mass: 0.1 });

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const trailId = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastMoveTime = useRef(0);

  const updateTrail = useCallback((x: number, y: number) => {
    const now = Date.now();
    const dt = now - lastMoveTime.current;
    if (dt < 25) return;

    const dx = x - lastX.current;
    const dy = y - lastY.current;
    const speed = Math.sqrt(dx * dx + dy * dy) / (dt || 1);

    setVelocity(Math.min(speed * 2, 1));

    if (speed > 0.3) {
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const id = trailId.current++;
      setTrail(prev => {
        const next = [...prev, { id, x, y, angle }];
        return next.length > 8 ? next.slice(-8) : next;
      });
      setTimeout(() => {
        setTrail(prev => prev.filter(d => d.id !== id));
      }, 350);
    }

    lastX.current = x;
    lastY.current = y;
    lastMoveTime.current = now;
  }, []);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout>;
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      updateTrail(e.clientX, e.clientY);
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(() => setVelocity(0), 100);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        'button, a, input, textarea, select, [role="button"], [data-cursor="pointer"], .xterm'
      );
      setIsHovering(!!interactive);
      setIsTyping(!!target.closest('input, textarea, [contenteditable="true"], .xterm'));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      clearTimeout(fadeTimer);
    };
  }, [cursorX, cursorY, updateTrail]);

  const cursorType = isTyping ? 'text' : isHovering ? 'pointer' : 'default';

  const g = isHovering ? '0,255,65' : '0,230,60';
  const dim = isHovering ? 0.9 : 0.6;
  const faint = isHovering ? 0.4 : 0.2;

  return (
    <div className="custom-cursor-layer" style={{ cursor: 'none' }}>
      {trail.map((dot) => (
        <motion.div
          key={dot.id}
          initial={{ opacity: 0.5, scale: 1, rotate: dot.angle }}
          animate={{ opacity: 0, scale: 0.1, rotate: dot.angle + 90 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            left: dot.x - 2,
            top: dot.y - 2,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: `rgba(${g},0.4)`,
            boxShadow: `0 0 4px rgba(${g},0.3)`,
            pointerEvents: 'none',
            zIndex: 99999,
          }}
        />
      ))}

      <motion.div
        style={{
          position: 'fixed',
          left: ringX,
          top: ringY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 100000,
        }}
        animate={{
          scale: isClicking ? 1.6 : isHovering ? 1.4 : 1 + velocity * 0.3,
          opacity: isClicking ? 0.8 : 0.15 + velocity * 0.15,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, mass: 0.1 }}
      >
        <motion.svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          animate={{ rotate: isHovering ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, mass: 0.1 }}
        >
          <rect
            x="12" y="12" width="4" height="4"
            transform="rotate(45 14 14)"
            fill={`rgba(${g},${faint})`}
            style={{ transition: 'fill 0.1s ease' }}
          />
          {[0, 90, 180, 270].map((angle) => {
            const cx = 14 + 10 * Math.cos((angle * Math.PI) / 180);
            const cy = 14 + 10 * Math.sin((angle * Math.PI) / 180);
            const lx = 14 + 6 * Math.cos((angle * Math.PI) / 180);
            const ly = 14 + 6 * Math.sin((angle * Math.PI) / 180);
            return (
              <line
                key={angle}
                x1={lx} y1={ly} x2={cx} y2={cy}
                stroke={`rgba(${g},${faint})`}
                strokeWidth="0.5"
                strokeLinecap="round"
              />
            );
          })}
        </motion.svg>
      </motion.div>

      <motion.div
        style={{
          position: 'fixed',
          left: cursorX,
          top: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 100001,
        }}
        animate={{
          scale: isClicking ? 0.7 : isHovering ? 1.2 : 1,
        }}
        transition={{ type: 'spring', stiffness: 600, damping: 20, mass: 0.05 }}
      >
        {cursorType === 'text' ? (
          <motion.div
            animate={{ scaleY: isClicking ? 0.6 : 1 }}
            transition={{ duration: 0.06 }}
            style={{
              width: 1.5,
              height: 20,
              background: `rgba(${g},${dim})`,
              boxShadow: `0 0 6px rgba(${g},0.5), 0 0 12px rgba(${g},0.2)`,
              borderRadius: 1,
            }}
          />
        ) : (
          <motion.svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            animate={{ rotate: isHovering ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, mass: 0.08 }}
          >
            <circle
              cx="9" cy="9" r="1.5"
              fill={`rgba(${g},${dim})`}
              style={{
                filter: `drop-shadow(0 0 3px rgba(${g},0.6))`,
                transition: 'fill 0.1s ease',
              }}
            />
            <line x1="9" y1="0.5" x2="9" y2="5.5" stroke={`rgba(${g},${faint})`} strokeWidth="0.75" strokeLinecap="round" />
            <line x1="9" y1="12.5" x2="9" y2="17.5" stroke={`rgba(${g},${faint})`} strokeWidth="0.75" strokeLinecap="round" />
            <line x1="0.5" y1="9" x2="5.5" y2="9" stroke={`rgba(${g},${faint})`} strokeWidth="0.75" strokeLinecap="round" />
            <line x1="12.5" y1="9" x2="17.5" y2="9" stroke={`rgba(${g},${faint})`} strokeWidth="0.75" strokeLinecap="round" />

            <rect x="6" y="6" width="6" height="6" rx="0.5"
              transform="rotate(45 9 9)"
              stroke={`rgba(${g},${isHovering ? 0.35 : 0.12})`}
              strokeWidth="0.5"
              fill="none"
              style={{ transition: 'stroke 0.1s ease' }}
            />
          </motion.svg>
        )}
      </motion.div>
    </div>
  );
};
