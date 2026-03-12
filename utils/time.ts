import { parseISO, formatDistanceToNowStrict, format } from "date-fns";
import { id } from "date-fns/locale";

function parseAuditTime(dateStr: string) {
  // Jika backend ngaco (ngirim jam lokal tapi dilabeli Z), 
  // kita hapus Z nya supaya dianggap waktu lokal oleh browser
  const cleanDateStr = dateStr.replace('Z', ''); 
  
  return new Date(cleanDateStr); 
}

export function formatAuditRelative(dateStr: string) {
  const date = parseAuditTime(dateStr);

  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: id,
  });
}

export function formatAuditDate(dateStr: string) {
  const date = parseAuditTime(dateStr);

  return format(date, "dd MMM yyyy", {
    locale: id,
  });
}

export function formatAuditClock(dateStr: string) {
  const date = parseAuditTime(dateStr);

  return format(date, "HH:mm:ss 'WIB'");
}