import React, { useEffect, useRef } from 'react';

const LiquidDonut = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    
    let time = 0;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    let reqId;
    const draw = () => {
      time += 0.007; // Slightly faster for visual texture flow
      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      // Size matched to span nearly the full height of the viewport as shown in the mockup
      const dimension = Math.min(width, height);
      const baseRadius = dimension * 0.35; 
      const innerR = baseRadius - dimension * 0.12;
      const outerR = baseRadius + dimension * 0.12;
      
      ctx.globalCompositeOperation = 'source-over';

      // 1. Soft base ring to provide volume (Original lighter size/style)
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
      // Original light icy blue base
      ctx.fillStyle = 'rgba(215, 235, 255, 0.4)';
      ctx.fill();

      // 2. High-density textured rings (striations)
      // Stepping by an even smaller amount (2 instead of 4) for significantly MORE stripes
      for (let r = innerR; r <= outerR; r += 2) {
        ctx.beginPath();
        
        const normalized = (r - innerR) / (outerR - innerR);
        const isMiddle = normalized > 0.3 && normalized < 0.7; // The middle band zone
        
        // Alternating thread colors
        const cIndex = (r - innerR) % 24;
        
        // Conditionally inject bright white lines heavily in the middle
        if (isMiddle && (cIndex === 0 || cIndex === 8 || cIndex === 16)) {
           ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'; // Explicit white lines
           ctx.lineWidth = 2.5; // Make the white lines stand out slightly
        } else {
           // Original lighter azure blue palette with the new dense textures
           if (cIndex < 8) ctx.strokeStyle = 'rgba(195, 222, 255, 0.8)';
           else if (cIndex < 16) ctx.strokeStyle = 'rgba(170, 205, 255, 0.85)';
           else ctx.strokeStyle = 'rgba(240, 248, 255, 0.9)';
           ctx.lineWidth = 1.2; // Thinner regular stripes for more texture
        }
        
        // Organically fade out edges
        const edgeAlpha = Math.sin(normalized * Math.PI); 
        ctx.globalAlpha = edgeAlpha * 0.95 + 0.05;

        // Path deformation
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.04) {
          const phase = r * 0.015;
          // Complex sine combinations for organic perlin-like liquid morphs
          const wave1 = Math.sin(a * 5 + time + phase);
          const wave2 = Math.cos(a * 4 - time * 0.8 + phase * 2);
          const wave3 = Math.sin(a * 8 + time * 1.5 + phase) * 0.5; // Added secondary rippling
          
          const displacement = (wave1 + wave2 + wave3) * 12;
          const currentR = r + displacement;
          
          const x = cx + Math.cos(a) * currentR;
          const y = cy + Math.sin(a) * currentR;
          
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1.0;

      reqId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(reqId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        filter: 'blur(0.8px)' // Just enough blur to blend the striated threads optimally
      }}
    />
  );
};

export default LiquidDonut;
