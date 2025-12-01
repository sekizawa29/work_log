'use client'

import { useState, useEffect } from 'react';

export const useTimer = (isActive: boolean, startTime: number | null) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!isActive || !startTime) {
            setElapsed(0);
            return;
        }

        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, startTime]);

    return elapsed;
};
