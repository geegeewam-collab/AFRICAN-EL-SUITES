// Short, human-friendly booking reference (e.g. SS-K3F9) shown to guests, in SMS and in the dashboard.
export const bookingRef = (id: string) => `SS-${id.slice(-4).toUpperCase()}`;
