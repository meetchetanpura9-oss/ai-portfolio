/**
 * Small dependency-free charts for the newsletter workspace.
 *
 * Series colours are a fixed, ordered palette validated for colour-blind separation and
 * contrast on the dark admin surface. Text always uses neutral ink; colour only marks
 * the series, and every chart has a legend plus a screen-reader table.
 */
import { useState } from "react";

const SERIES = ["#3987e5", "#d95926", "#199e70"];

export function Legend({ items }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400">
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES[i] }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** Daily line chart. `series` = [{ key, label }], `data` = [{ date, [key]: number }]. */
export function TrendChart({ data, series, label }) {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = 200;
  const pad = { top: 12, right: 12, bottom: 24, left: 30 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const peak = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key] || 0)));
  const top = peak <= 4 ? 4 : Math.ceil(peak / 4) * 4; // whole-number gridlines
  const x = (i) => pad.left + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2);
  const y = (v) => pad.top + innerH - (v / top) * innerH;
  const path = (key) => data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[key] || 0).toFixed(1)}`).join(" ");
  const ticks = [0, top / 2, top];
  const labelAt = [0, Math.floor((data.length - 1) / 2), data.length - 1];
  const active = hover === null ? null : data[hover];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={pad.left - 8} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#6b7280">
              {t}
            </text>
          </g>
        ))}
        {labelAt.map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize="10" fill="#6b7280">
            {shortDate(data[i].date)}
          </text>
        ))}
        {series.map((s, i) => (
          <path key={s.key} d={path(s.key)} fill="none" stroke={SERIES[i]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {active && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            {series.map((s, i) => (
              <circle key={s.key} cx={x(hover)} cy={y(active[s.key] || 0)} r="4" fill={SERIES[i]} stroke="#0a0f1f" strokeWidth="2" />
            ))}
          </g>
        )}
        {/* One hit column per day, wider than the marks. */}
        {data.map((d, i) => (
          <rect
            key={d.date}
            x={x(i) - innerW / data.length / 2}
            y={pad.top}
            width={innerW / data.length}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
          />
        ))}
      </svg>
      {active && (
        <div
          role="status"
          className="pointer-events-none absolute top-1 z-10 w-max -translate-x-1/2 rounded-lg border border-white/10 bg-[#0c1224] px-3 py-2 text-[11px] shadow-xl"
          style={{ left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%` }}
        >
          <p className="mb-1 font-semibold text-white">{shortDate(active.date)}</p>
          {series.map((s, i) => (
            <p key={s.key} className="flex items-center gap-1.5 text-gray-300">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SERIES[i] }} />
              {s.label}: <span className="font-semibold tabular-nums text-white">{active[s.key] || 0}</span>
            </p>
          ))}
        </div>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Date</th>
            {series.map((s) => (
              <th key={s.key}>{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              {series.map((s) => (
                <td key={s.key}>{d[s.key] || 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Horizontal percentage bars (0–100) grouped per row. `rows` = [{ id, title, values: [n|null] }]. */
export function RateBars({ rows, series }) {
  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <li key={row.id}>
          <p className="mb-1.5 truncate text-xs font-semibold text-white">{row.title}</p>
          <div className="space-y-1">
            {series.map((name, i) => {
              const value = row.values[i];
              return (
                <div key={name} className="flex items-center gap-2" title={`${name}: ${value == null ? "not reported" : `${value}%`}`}>
                  <span className="sr-only">{name}</span>
                  <div className="h-2 flex-1 rounded-r bg-white/[0.04]">
                    {value != null && <div className="h-2 rounded-r" style={{ width: `${Math.min(100, Math.max(value, 0.5))}%`, backgroundColor: SERIES[i] }} />}
                  </div>
                  <span className="w-11 shrink-0 text-right text-[11px] tabular-nums text-gray-300">{value == null ? "—" : `${value}%`}</span>
                </div>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Single-hue magnitude bars for a funnel (sent → delivered → opened → clicked). */
export function FunnelBars({ steps }) {
  const peak = Math.max(1, ...steps.map((s) => s.value || 0));
  return (
    <ul className="space-y-2.5">
      {steps.map((step) => (
        <li key={step.label} className="flex items-center gap-3 text-xs" title={`${step.label}: ${step.value ?? "not reported"}`}>
          <span className="w-20 shrink-0 text-gray-400">{step.label}</span>
          <div className="h-2.5 flex-1 rounded-r bg-white/[0.04]">
            {step.value != null && step.value > 0 && <div className="h-2.5 rounded-r" style={{ width: `${(step.value / peak) * 100}%`, backgroundColor: SERIES[0] }} />}
          </div>
          <span className="w-24 shrink-0 text-right tabular-nums text-gray-200">
            {step.value == null ? "—" : step.value.toLocaleString()}
            {step.rate != null && <span className="ml-1.5 text-[10px] text-gray-500">{step.rate}%</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
