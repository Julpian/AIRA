"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction"; // Tambahkan untuk interaktivitas masa depan

/* ================= TYPES ================= */

export type CalendarMode = "month" | "semester" | "year";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps?: {
    period?: string;
  };
};

type Props = {
  events: CalendarEvent[];
  mode: CalendarMode;
};

/* ================= HELPERS ================= */

function getPeriodStyle(period?: string) {
  switch (period) {
    case "monthly":
      return {
        label: "BLN",
        colorClass: "border-l-sky-500 bg-sky-500/10 text-sky-400",
        tagClass: "bg-sky-500/20 text-sky-300"
      };
    case "semester":
      return {
        label: "6 BLN",
        colorClass: "border-l-purple-500 bg-purple-500/10 text-purple-400",
        tagClass: "bg-purple-500/20 text-purple-300"
      };
    case "yearly":
      return {
        label: "THN",
        colorClass: "border-l-emerald-500 bg-emerald-500/10 text-emerald-400",
        tagClass: "bg-emerald-500/20 text-emerald-300"
      };
    default:
      return {
        label: "INS",
        colorClass: "border-l-slate-500 bg-slate-500/10 text-slate-400",
        tagClass: "bg-slate-500/20 text-slate-300"
      };
  }
}

/* ================= COMPONENT ================= */

export default function ScheduleCalendar({ events, mode }: Props) {
  const initialView =
    mode === "month"
      ? "dayGridMonth"
      : mode === "semester"
      ? "multiMonth6"
      : "multiMonthYear";
  
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  return (
    <div className="calendar-container w-full overflow-hidden rounded-xl">
      <FullCalendar
        key={mode}
        plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
        locale="id"
        height={mode === "month" ? 650 : "auto"}
        initialView={initialView}
        initialDate={mode === "year" ? yearStart : undefined}
        events={events}
        firstDay={1} // Mulai dari hari Senin
        
        views={{
          multiMonth6: {
            type: "multiMonth",
            duration: { months: 6 },
          },
          multiMonthYear: {
            type: "multiMonth",
            duration: { months: 12 },
          },
        }}

        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}

        dayMaxEventRows={3}
        eventClassNames="p-0 border-none bg-transparent" // Hilangkan style default FC
        
        eventContent={(arg) => {
          const style = getPeriodStyle(arg.event.extendedProps?.period);

          return (
            <div className={`flex flex-col gap-0.5 px-2 py-1 border-l-2 shadow-sm rounded-r-md transition-all hover:brightness-125 ${style.colorClass} w-full`}>
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-[10px] font-bold leading-tight uppercase">
                  {arg.event.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                 <span className={`px-1 rounded-[3px] text-[8px] font-extrabold tracking-tighter ${style.tagClass}`}>
                    {style.label}
                 </span>
                 <span className="text-[8px] opacity-60 font-medium">
                    {new Date(arg.event.start!).toLocaleDateString('id', {day: 'numeric', month: 'short'})}
                 </span>
              </div>
            </div>
          );
        }}
      />

      <style jsx global>{`
        /* Clean & Professional Overrides */
        .fc { --fc-border-color: rgba(255, 255, 255, 0.05); --fc-page-bg-color: transparent; }
        
        /* Header styling */
        .fc .fc-toolbar-title { font-size: 1.1rem !important; font-weight: 800; color: #f8fafc; text-transform: capitalize; }
        .fc .fc-button-primary { background-color: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #94a3b8 !important; text-transform: uppercase; font-size: 10px !important; font-weight: 700; transition: all 0.2s; }
        .fc .fc-button-primary:hover { background-color: rgba(255,255,255,0.1) !important; color: #fff !important; }
        .fc .fc-button-active { background-color: #6366f1 !important; color: white !important; border-color: #6366f1 !important; }

        /* Grid styling */
        .fc-theme-standard td, .fc-theme-standard th { border: 1px solid rgba(255,255,255,0.03) !important; }
        .fc-col-header-cell { background: rgba(15, 23, 42, 0.3); py: 12px !important; }
        .fc .fc-col-header-cell-cushion { color: #64748b !important; font-size: 10px !important; font-weight: 800; text-transform: uppercase; tracking: 0.05em; }
        
        /* Day cell styling */
        .fc .fc-daygrid-day-number { color: #475569 !important; font-size: 11px !important; font-weight: 600; padding: 8px !important; }
        .fc .fc-day-today { background: rgba(99, 102, 241, 0.05) !important; }
        .fc .fc-day-today .fc-daygrid-day-number { color: #818cf8 !important; font-size: 13px !important; }
        
        /* Event item spacing */
        .fc-daygrid-event-harness { margin: 2px 4px !important; }
        
        /* Multi-month specific adjustments */
        .fc-multimonth-month { border: none !important; }
        .fc-multimonth-title { font-size: 0.9rem !important; font-weight: 800; color: #2dd4bf; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem !important; }

        /* Popover (More link) */
        .fc .fc-popover { background: bg-slate-50 !important; border: 1px solid #1e293b !important; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5) !important; border-radius: 12px !important; }
        .fc .fc-popover-header { background: #1e293b !important; color: white !important; padding: 8px 12px !important; border-radius: 11px 11px 0 0 !important; }
      `}</style>
    </div>
  );
}