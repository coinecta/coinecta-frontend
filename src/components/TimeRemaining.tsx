import React, { FC, useState, useEffect } from 'react';
import {
  Box,
  Tooltip
} from '@mui/material'
import dayjs from 'dayjs';

const timeRemaining = (endTime: Date) => {
  const now = Date.now()
  const diff = (endTime.getTime() - now) / 1000;

  let seconds: string | number = Math.floor(diff % 60).toString().padStart(2, '0'),
    minutes: string | number = Math.floor((diff / 60) % 60).toString().padStart(2, '0'),
    hours: string | number = Math.floor((diff / (60 * 60)) % 24).toString().padStart(2, '0'),
    days: string | number = Math.floor((diff / (60 * 60)) / 24);

  let dayWord = 'days'
  if (days === 1) dayWord = 'day'

  if (days > 0) days = `${days} ${dayWord} and `
  else days = ``

  if (diff < 0) return `00:00:00`
  return `${days}${hours}:${minutes}:${seconds}`;
}

const TimeRemaining: FC<{ endTime: Date, noDay?: boolean }> = ({ endTime, noDay }) => {
  const [timeLeft, setTimeLeft] = useState(timeRemaining(endTime));

  useEffect(() => {
    const remainingTimeInSeconds = (endTime.getTime() - new Date().getTime()) / 1000;
    const lessThan24Hours = remainingTimeInSeconds <= 24 * 60 * 60;

    if (!noDay || lessThan24Hours) {
      const timer = setTimeout(() => {
        setTimeLeft(timeRemaining(endTime));
      }, 1000);

      return () => clearTimeout(timer);
    }
    else {
      setTimeLeft(dayjs(endTime).format('YYYY-MM-DD h:mma'))
    }
  });

  const date = endTime.toString()

  return <Tooltip title={date} arrow placement="top"><Box sx={{ display: 'inline-block' }}>{timeLeft}</Box></Tooltip>
}

export default TimeRemaining