"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Range, isTaken, parse, rangeFree, todayNairobi, fmt, addDays } from "@/lib/dates";

interface Props {
  ranges: Range[];
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pretty = (s: string) => new Date(parse(s)).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export default function AvailabilityCalendar({ ranges, checkIn, checkOut, onChange }: Props) {
  const today = todayNairobi();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [y, m] = month.split("-").map(Number);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const lead = useMemo(() => new Date(Date.UTC(y, m - 1, 1)).getUTCDay(), [y, m]);
  const dim = useMemo(() => new Date(Date.UTC(y, m, 0)).getUTCDate(), [y, m]);
  const days = useMemo(() => Array.from({ length: dim }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`), [month, dim]);

  const pickingOut = !!checkIn && !checkOut;
  const canIn = (d: string) => d >= today && !isTaken(d, ranges);
  const canOut = (d: string) => pickingOut && d > checkIn && rangeFree(checkIn, d, ranges);
  const isWeekend = (d: string) => {
    const dow = new Date(parse(d)).getUTCDay();
    return dow === 5 || dow === 6; // Fri, Sat
  };

  const click = (d: string) => {
    if (canOut(d)) onChange(checkIn, d);
    else if (canIn(d)) onChange(d, "");
  };

  const shift = (n: number) => setMonth(new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7));
  const firstMonth = today.slice(0, 7);
  const addMonths = (ym: string, n: number) => new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7) - 1 + n, 1)).toISOString().slice(0, 7);
  const lastMonth = new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1 + 11, 1)).toISOString().slice(0, 7);

  const hint = !checkIn ? "Select check-in" : pickingOut ? "Select check-out" : "Click to change";

  // Show 2 months side by side on desktop
  const [showTwoMonths, setShowTwoMonths] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setShowTwoMonths(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const renderMonth = (offset: number) => {
    const targetDate = new Date(Date.UTC(y, m - 1 + offset, 1));
    const ty = targetDate.getUTCFullYear();
    const tm = targetDate.getUTCMonth() + 1;
    const tMonthStr = `${ty}-${String(tm).padStart(2, "0")}`;
    const tLead = new Date(Date.UTC(ty, tm - 1, 1)).getUTCDay();
    const tDim = new Date(Date.UTC(ty, tm, 0)).getUTCDate();
    const tDays = Array.from({ length: tDim }, (_, i) => `${tMonthStr}-${String(i + 1).padStart(2, "0")}`);

    return (
      <div key={tMonthStr} className="min-w-0 flex-1">
        {showTwoMonths && (
          <div className="text-center mb-2 text-white/50 text-xs uppercase tracking-wider">
            {MONTHS[tm - 1]} {ty}
          </div>
        )}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DOW.map((d, i) => (
            <div key={i} className="h-8 flex items-center justify-center text-white/30 text-[10px] uppercase font-medium">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: tLead }, (_, i) => (
            <span key={`e${i}`} className="h-10" />
          ))}
          {tDays.map((d) => {
            const isEdge = d === checkIn || d === checkOut;
            const inRange = !!checkIn && !!checkOut && d > checkIn && d < checkOut;
            const ok = (d >= today && !isTaken(d, ranges)) || (pickingOut && canOut(d));
            const isHovered = hoverDate === d;
            const weekend = isWeekend(d);

            let cls = "h-10 text-sm rounded-sm transition-all duration-150 relative ";
            if (isEdge) {
              cls += "bg-[#B8935A] text-[#0B1526] font-medium shadow-md z-10";
            } else if (inRange) {
              cls += "bg-[#B8935A]/15 text-white";
            } else if (ok) {
              cls += "text-white hover:bg-white/10";
              if (weekend) cls += " font-medium";
            } else {
              cls += "cursor-not-allowed ";
              cls += d >= today && isTaken(d, ranges) ? "text-white/30 line-through decoration-white/40" : "text-white/15";
            }
            if (isHovered && ok && !isEdge) cls += " bg-white/5";

            return (
              <button
                key={d}
                type="button"
                disabled={!ok && !isEdge}
                onClick={() => click(d)}
                onMouseEnter={() => setHoverDate(d)}
                onMouseLeave={() => setHoverDate(null)}
                className={cls}
                aria-label={pretty(d)}
                aria-selected={isEdge}
                aria-disabled={!ok && !isEdge}
              >
                {Number(d.slice(8))}
                {weekend && ok && !isEdge && !inRange && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B8935A]/50" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-sm p-4 md:p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <button
          type="button"
          onClick={() => shift(showTwoMonths ? -2 : -1)}
          disabled={month <= firstMonth}
          aria-label="Previous month"
          className="p-2 text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/5"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          {showTwoMonths ? (
            <>
              <span className="text-white text-sm font-medium">{MONTHS[m - 1]} {y}</span>
              <span className="mx-2 text-white/30">·</span>
              <span className="text-white/50 text-sm">{MONTHS[((m) % 12)]} {m === 12 ? y + 1 : y}</span>
            </>
          ) : (
            <span className="text-white text-sm font-medium">{MONTHS[m - 1]} {y}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => shift(showTwoMonths ? 2 : 1)}
          disabled={month >= (showTwoMonths ? addMonths(lastMonth, -1) : lastMonth)}
          aria-label="Next month"
          className="p-2 text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/5"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex gap-4 md:gap-6">
        {renderMonth(0)}
        {showTwoMonths && renderMonth(1)}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-white/70">
            <Calendar size={14} style={{ color: "#B8935A" }} />
            <span>
              {checkIn ? pretty(checkIn) : <span className="text-white/40">Check-in</span>}{" "}
              <span className="text-white/30 mx-1">→</span>{" "}
              {checkOut ? pretty(checkOut) : <span className="text-white/40">Check-out</span>}
            </span>
          </div>
          <span className="text-white/40 text-xs whitespace-nowrap">{hint}</span>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#B8935A]" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#B8935A]/15 border border-white/10" />
            <span>Your stay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-white/10 relative">
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B8935A]/50" />
            </span>
            <span>Weekend rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/40 line-through decoration-white/50 text-xs leading-none">12</span>
            <span>Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
}