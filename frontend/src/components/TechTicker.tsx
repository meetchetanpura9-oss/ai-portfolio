"use client";

import { FaChartBar, FaJava, FaPython, FaReact } from "react-icons/fa";
import { SiDocker, SiFastapi, SiLangchain, SiNextdotjs, SiPostgresql } from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import { siteContent } from "../data/siteContent";

const icons = [FaPython, FaJava, FaReact, SiNextdotjs, SiFastapi, SiDocker, SiPostgresql, VscAzure, SiLangchain, FaChartBar];
const items = siteContent.technologies.map((name, index) => ({ name, Icon: icons[index] }));

export default function TechTicker() {
  const loop = [...items, ...items];
  return (
    <section className="ticker-panel" aria-label="Technology stack">
      <div className="ticker-header shell"><span>MC TECH EXCHANGE</span><span className="ticker-live"><i /> LIVE CAPABILITIES</span></div>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {loop.map(({ name, Icon }, index) => <div className="ticker-item" key={`${name}-${index}`} aria-hidden={index >= items.length}><Icon /><span>{name}</span><b>READY</b><small>+{(2.1 + (index % 7) * .37).toFixed(2)}%</small></div>)}
        </div>
      </div>
    </section>
  );
}
