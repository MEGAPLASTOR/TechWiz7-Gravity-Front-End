import { useEffect, useRef } from 'react';

export function use3DTilt(maxTilt = 12, scale = 1.02) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frameId = null;

    const handleMouseMove = (e) => {
      if (frameId) cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = (mouseX / width - 0.5) * 2; // -1 to 1
        const yPct = (mouseY / height - 0.5) * 2; // -1 to 1

        const rotateX = -yPct * maxTilt;
        const rotateY = xPct * maxTilt;

        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
        el.style.transition = 'transform 100ms ease-out';
      });
    };

    const handleMouseLeave = () => {
      if (frameId) cancelAnimationFrame(frameId);
      el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      el.style.transition = 'transform 400ms var(--ease-smooth)';
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [maxTilt, scale]);

  return ref;
}
