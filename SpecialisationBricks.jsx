import { useEffect, useRef, useCallback } from 'react';

const SKILLS = [
  'Web Design',
  'A/B Testing',
  'Wireframing',
  'Prototyping',
  'Mind Mapping',
  'UI/UX Design',
  'User Research',
  'Design System',
  'Information Architecture',
  'Mobile App Design',
  'Interaction Design',
  'SaaS Product Design',
  'User Journey & Flow',
  'Requirement Analysis',
  'User-Centered Design',
  'Agile Methodologies',
];

const COLORS = [
  '#4a7c59', '#c0392b', '#2980b9', '#8e44ad', '#7f8c8d',
  '#d35400', '#27ae60', '#2c3e50', '#e67e22', '#16a085',
];

const PADDING_X = 18;
const PADDING_Y = 12;
const FONT = 'bold 13px system-ui, sans-serif';
const RADIUS = 8;
const DROP_INTERVAL = 120;
const CANVAS_HEIGHT = 500;
const FLOOR_THICKNESS = 50;

export default function SpecialisationBricks() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const renderLoopRef = useRef(null);
  const bodiesRef = useRef([]);
  const dropTimersRef = useRef([]);
  const MatterRef = useRef(null);

  const measureText = useCallback((text) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = FONT;
    const w = ctx.measureText(text).width + PADDING_X * 2;
    const h = 36;
    return { w, h };
  }, []);

  const drawRoundedRect = (ctx, x, y, w, h, r, fill) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const startSimulation = useCallback(() => {
    const Matter = MatterRef.current;
    if (!Matter) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { Engine, Bodies, World, Events, Body } = Matter;

    // Clear previous run
    dropTimersRef.current.forEach(clearTimeout);
    dropTimersRef.current = [];
    if (renderLoopRef.current) cancelAnimationFrame(renderLoopRef.current);
    if (engineRef.current) {
      World.clear(engineRef.current.world);
      Engine.clear(engineRef.current);
    }

    bodiesRef.current = [];

    const W = canvas.width;
    const H = CANVAS_HEIGHT;

    const engine = Engine.create({ gravity: { y: 1.8 } });
    engineRef.current = engine;

    // Static walls
    const floor = Bodies.rectangle(W / 2, H + FLOOR_THICKNESS / 2, W * 2, FLOOR_THICKNESS, { isStatic: true });
    const wallL = Bodies.rectangle(-25, H / 2, 50, H * 2, { isStatic: true });
    const wallR = Bodies.rectangle(W + 25, H / 2, 50, H * 2, { isStatic: true });
    World.add(engine.world, [floor, wallL, wallR]);

    // Schedule drops
    SKILLS.forEach((label, i) => {
      const { w, h } = measureText(label);
      const color = COLORS[i % COLORS.length];
      const timer = setTimeout(() => {
        const x = PADDING_X + Math.random() * Math.max(1, W - w - PADDING_X * 2);
        const body = Bodies.rectangle(x + w / 2, -h / 2 - 20, w, h, {
          restitution: 0.1,
          friction: 0.8,
          frictionAir: 0.02,
          angle: (Math.random() - 0.5) * 0.3,
          label,
          render: { fillStyle: color },
        });
        body._cardColor = color;
        body._cardW = w;
        body._cardH = h;
        body._cardLabel = label;
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
        World.add(engine.world, body);
        bodiesRef.current.push(body);
      }, i * DROP_INTERVAL);
      dropTimersRef.current.push(timer);
    });

    // Render loop
    const ctx = canvas.getContext('2d');
    let last = performance.now();

    function loop(now) {
      const delta = Math.min(now - last, 32);
      last = now;
      Engine.update(engine, delta);

      ctx.clearRect(0, 0, W, H);

      bodiesRef.current.forEach((body) => {
        const { x, y } = body.position;
        const angle = body.angle;
        const w = body._cardW;
        const h = body._cardH;
        const color = body._cardColor;
        const label = body._cardLabel;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        drawRoundedRect(ctx, -w / 2, -h / 2, w, h, RADIUS, color);
        ctx.font = FONT;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      });

      renderLoopRef.current = requestAnimationFrame(loop);
    }

    renderLoopRef.current = requestAnimationFrame(loop);
  }, [measureText]);

  const handleCanvasClick = useCallback((e) => {
    const Matter = MatterRef.current;
    if (!Matter) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { Body, Vector } = Matter;

    bodiesRef.current.forEach((body) => {
      const dx = body.position.x - mx;
      const dy = body.position.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < Math.max(body._cardW, body._cardH) / 2 + 8) {
        const impulse = Vector.create(
          (Math.random() - 0.5) * 0.012,
          -0.018 - Math.random() * 0.008
        );
        Body.applyForce(body, body.position, impulse);
      }
    });
  }, []);

  useEffect(() => {
    // Load Matter.js from CDN if not present
    if (window.Matter) {
      MatterRef.current = window.Matter;
      startSimulation();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
    script.onload = () => {
      MatterRef.current = window.Matter;
      startSimulation();
    };
    document.head.appendChild(script);

    return () => {
      dropTimersRef.current.forEach(clearTimeout);
      if (renderLoopRef.current) cancelAnimationFrame(renderLoopRef.current);
      if (engineRef.current && window.Matter) {
        window.Matter.World.clear(engineRef.current.world);
        window.Matter.Engine.clear(engineRef.current);
      }
    };
  }, [startSimulation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
    });
    resizeObserver.observe(canvas);
    canvas.width = canvas.offsetWidth;
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
          Areas of Specialisation
        </h2>
        <button
          onClick={startSimulation}
          style={{
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: '100px',
            padding: '0.5rem 1.25rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          Reset
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        height={CANVAS_HEIGHT}
        style={{
          width: '100%',
          height: `${CANVAS_HEIGHT}px`,
          display: 'block',
          cursor: 'pointer',
          borderRadius: '12px',
          background: '#f5f5f5',
        }}
      />
    </div>
  );
}
