"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { siteContent } from "../data/siteContent";

export default function AboutGallery() {
  const [active, setActive] = useState(0);
  const images = siteContent.about.images;
  useEffect(() => { const timer = setInterval(() => setActive(value => (value + 1) % images.length), 4300); return () => clearInterval(timer); }, [images.length]);
  const move = (direction: number) => setActive(value => (value + direction + images.length) % images.length);

  return <div className="portrait-module" onContextMenu={event => event.preventDefault()}>
    <div className="portrait-viewport">
      <div className="portrait-track" style={{ transform: `translateX(-${active * 100}%)` }}>
        {images.map(image => <div className="portrait-frame" key={image.src}><Image src={image.src} alt={image.alt} fill priority={image.src.includes("linkedin")} sizes="(max-width: 768px) 94vw, 46vw" draggable={false}/><div className="portrait-watermark" aria-hidden>{Array.from({ length: 12 }, (_, index) => <span key={index}>MC INTELLIGENCE</span>)}</div></div>)}
      </div>
      <div className="portrait-badge type-caption"><ShieldCheck size={14}/> Protected portfolio preview</div>
      <div className="portrait-controls"><button aria-label="Previous photograph" onClick={() => move(-1)}><ChevronLeft size={18}/></button><span className="type-caption">{String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span><button aria-label="Next photograph" onClick={() => move(1)}><ChevronRight size={18}/></button></div>
    </div>
  </div>;
}
