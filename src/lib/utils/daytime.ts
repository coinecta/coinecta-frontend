export const timeFromNow = (time: Date) => {
  const now = Date.now()
  const diff = (now - time.getTime()) / 1000;

  let seconds: string | number = Math.floor(diff % 60),
    minutes: string | number = Math.floor((diff / 60) % 60),
    hours: string | number = Math.floor((diff / (60 * 60)) % 24),
    days: string | number = Math.floor((diff / (60 * 60)) / 24);

  if (days < 1 && hours > 0) return hours + " hours ago"
  if (days < 1 && hours < 1 && minutes < 1) return "just now"
  if (days < 1 && hours < 1 && minutes > 1) return minutes + " minutes ago"
  if (days > 0 && days < 2) return days + " day ago"
  if (days > 0) return days + " days ago"
}

export const formatDateForInput = (dateInput: Date | string) => {
  const pad = (number: number) => (number < 10 ? '0' + number : number.toString());

  // Helper function to ensure the value is within the specified range
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  // If dateInput is a string, try to correct potential typos
  if (typeof dateInput === 'string') {
    const parts = dateInput.split(/[-T:]/);

    if (parts.length >= 5) {
      const year = clamp(parseInt(parts[0], 10), 1000, 9999);
      const month = clamp(parseInt(parts[1], 10), 1, 12);
      const day = clamp(parseInt(parts[2], 10), 1, 31);
      const hour = clamp(parseInt(parts[3], 10), 0, 23);
      const minute = clamp(parseInt(parts[4], 10), 0, 59);

      return `${pad(year)}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
    }
  }

  // If dateInput is a Date object or the string couldn't be parsed, convert to Date object
  const dateObject = dateInput instanceof Date ? dateInput : new Date(dateInput);

  // If dateObject is not a valid date, return current date and time set to 12:00 AM.
  if (isNaN(dateObject.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T00:00`;
  }

  // If date is valid, format and return it.
  return `${dateObject.getFullYear()}-${pad(dateObject.getMonth() + 1)}-${pad(dateObject.getDate())}T${pad(dateObject.getHours())}:${pad(dateObject.getMinutes())}`;
};