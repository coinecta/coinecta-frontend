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