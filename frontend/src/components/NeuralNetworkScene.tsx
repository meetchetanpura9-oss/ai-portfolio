"use client";

import { useEffect, useRef } from "react";
import styles from "./NeuralNetworkScene.module.css";

type Node = { x: number; y: number; z: number; layer: number };
type Projected = { x: number; y: number; depth: number; scale: number };

const layerCounts = [5, 7, 9, 7, 5];
const layerNames = ["INPUT", "FEATURES", "MODEL", "INFERENCE", "OUTPUT"];
const nodes: Node[] = layerCounts.flatMap((count, layer) =>
  Array.from({ length: count }, (_, index) => {
    const angle = index * 2.39996 + layer * 0.53;
    const radius = Math.sqrt((index + 0.65) / count) * 112;
    return {
      x: (layer - 2) * 87,
      y: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      layer,
    };
  }),
);

const edges = nodes.flatMap((node, from) => {
  if (node.layer === layerCounts.length - 1) return [];
  return nodes
    .map((candidate, to) => ({
      to,
      distance: Math.hypot(node.y - candidate.y, node.z - candidate.z),
      layer: candidate.layer,
    }))
    .filter((candidate) => candidate.layer === node.layer + 1)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 2)
    .map(({ to }) => [from, to] as const);
});

function project(node: Node, yaw: number, pitch: number, width: number, height: number): Projected {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosX = Math.cos(pitch);
  const sinX = Math.sin(pitch);
  const x = node.x * cosY - node.z * sinY;
  const rotatedZ = node.x * sinY + node.z * cosY;
  const y = node.y * cosX - rotatedZ * sinX;
  const z = node.y * sinX + rotatedZ * cosX;
  const perspective = 680 / (680 + z);
  const size = Math.min(width, height) / 490;
  return {
    x: width / 2 + x * perspective * size,
    y: height / 2 + y * perspective * size,
    depth: z,
    scale: perspective * size,
  };
}

export default function NeuralNetworkScene() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!stage || !canvas || !context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let pointerX = 0;
    let pointerY = 0;
    let lastFrame = 0;

    const draw = (time: number) => {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);

      const yaw = motionQuery.matches ? -0.28 : -0.28 + Math.sin(time * 0.00022) * 0.18 + pointerX * 0.48;
      const pitch = motionQuery.matches ? 0.18 : 0.18 + Math.sin(time * 0.00016) * 0.06 + pointerY * 0.25;
      const points = nodes.map((node) => project(node, yaw, pitch, width, height));

      // A faint coordinate system gives the scene depth without competing with the text.
      context.save();
      context.translate(width / 2, height / 2);
      context.strokeStyle = "rgba(116, 230, 210, 0.11)";
      context.lineWidth = 1;
      for (const radius of [100, 170, 235]) {
        context.beginPath();
        context.ellipse(0, 0, radius * Math.min(width, height) / 490, radius * 0.42 * Math.min(width, height) / 490, -0.28, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();

      for (const [from, to] of edges) {
        const start = points[from];
        const end = points[to];
        const opacity = Math.max(0.1, Math.min(0.38, 0.27 - (start.depth + end.depth) / 1800));
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = `rgba(105, 217, 201, ${opacity})`;
        context.lineWidth = Math.max(0.7, start.scale);
        context.stroke();
      }

      points
        .map((point, index) => ({ point, index }))
        .sort((a, b) => b.point.depth - a.point.depth)
        .forEach(({ point, index }) => {
          const layer = nodes[index].layer;
          const radius = (layer === 2 ? 4.2 : 3.1) * point.scale;
          const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 5);
          glow.addColorStop(0, layer === 2 ? "rgba(171, 255, 233, 0.65)" : "rgba(111, 197, 255, 0.45)");
          glow.addColorStop(1, "rgba(111, 197, 255, 0)");
          context.fillStyle = glow;
          context.beginPath();
          context.arc(point.x, point.y, radius * 5, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = layer === 2 ? "#c1ffeb" : layer === 4 ? "#a9d8ff" : "#80e4d1";
          context.beginPath();
          context.arc(point.x, point.y, radius, 0, Math.PI * 2);
          context.fill();
        });

      const center = project({ x: 0, y: 0, z: 0, layer: 2 }, yaw, pitch, width, height);
      const pulse = motionQuery.matches ? 1 : 1 + Math.sin(time * 0.002) * 0.08;
      context.beginPath();
      context.arc(center.x, center.y, 20 * center.scale * pulse, 0, Math.PI * 2);
      context.strokeStyle = "rgba(192, 255, 235, 0.7)";
      context.lineWidth = 1.5;
      context.stroke();
    };

    const loop = (time: number) => {
      frame = 0;
      if (!visible || motionQuery.matches) return;
      if (time - lastFrame >= 30) {
        draw(time);
        lastFrame = time;
      }
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      draw(0);
      if (visible && !motionQuery.matches && !frame) frame = requestAnimationFrame(loop);
    };
    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      start();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerQuery.matches || motionQuery.matches) return;
      const bounds = stage.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    };
    const onPointerLeave = () => { pointerX = 0; pointerY = 0; };
    const onMotionChange = () => {
      if (motionQuery.matches) { cancelAnimationFrame(frame); frame = 0; }
      start();
    };
    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    resizeObserver.observe(stage);
    visibilityObserver.observe(stage);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);
    motionQuery.addEventListener("change", onMotionChange);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.stage} role="img" aria-label="Illustrative three-dimensional neural network. Data passes through feature, model, and inference layers toward an output.">
      <div className={styles.grid} aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.corner} aria-hidden="true"><span className={styles.statusDot} /> AI / ML SYSTEM MAP</div>
      <div className={styles.axis} aria-hidden="true">{layerNames.map((name) => <span key={name}>{name}</span>)}</div>
      <div className={styles.note} aria-hidden="true">ILLUSTRATIVE SYSTEM MAP <span>↗</span></div>
    </div>
  );
}
