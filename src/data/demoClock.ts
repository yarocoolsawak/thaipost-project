// All mock data is dated relative to when the demo is opened, so the scenarios
// (within SLA / close to SLA / SLA exceeded) look the same whichever day someone tries it.
export const DEMO_NOW = new Date();

const MS_PER_HOUR = 3600 * 1000;

export const hoursAgo = (h: number) => new Date(DEMO_NOW.getTime() - h * MS_PER_HOUR).toISOString();
export const hoursAhead = (h: number) => new Date(DEMO_NOW.getTime() + h * MS_PER_HOUR).toISOString();

// QMS / Track & Trace style timestamp: "YYYY-MM-DD HH:mm:ss" in local time
export const formatEventTimestamp = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const eventStamp = (hoursAgoValue: number) => formatEventTimestamp(new Date(DEMO_NOW.getTime() - hoursAgoValue * MS_PER_HOUR));
