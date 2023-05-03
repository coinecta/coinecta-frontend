import React, { FC, useState, useEffect } from 'react';
import {
  Box,
  Tooltip
} from '@mui/material'

const timeRemaining = (endTime: Date) => {
  const now = Date.now()
  const diff = (endTime.getTime() - now) / 1000;

  let seconds: string | number = Math.floor(diff % 60),
    minutes: string | number = Math.floor((diff / 60) % 60),
    hours: string | number = Math.floor((diff / (60 * 60)) % 24),
    days: string | number = Math.floor((diff / (60 * 60)) / 24);

  if (diff < 0) return 'No current sale'

  return days + "d, " + hours + "h, " + minutes + "m, " + seconds + "s";
}

const TimeRemaining: FC<{ endTime: Date }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(timeRemaining(endTime));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(timeRemaining(endTime));
    }, 1000);

    return () => clearTimeout(timer);
  });

  const date = endTime.toString()

  return <Tooltip title={date} arrow placement="top"><Box>{timeLeft}</Box></Tooltip>
}

export default TimeRemaining