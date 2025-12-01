'use client'

import { useState } from 'react';
import {
    LandingHeader,
    HeroTimer,
    FeatureSection,
    HowItWorks,
    CTASection,
    SignupModal,
    Footer,
} from './(landing)/_components';

// Key for localStorage
const PENDING_TIMER_KEY = 'ticlog_pending_timer';

interface PendingTimer {
    taskName: string;
    clientId: string;
    duration: number;
    timestamp: number;
}

export default function LandingPage() {
    const [showSignupModal, setShowSignupModal] = useState(false);

    const handleTimerStop = (taskName: string, clientId: string, duration: number) => {
        // Save pending timer data to localStorage
        const pendingTimer: PendingTimer = {
            taskName,
            clientId,
            duration,
            timestamp: Date.now(),
        };
        localStorage.setItem(PENDING_TIMER_KEY, JSON.stringify(pendingTimer));

        // Show signup modal
        setShowSignupModal(true);
    };

    return (
        <div className="min-h-screen">
            <LandingHeader />

            <main>
                <HeroTimer onTimerStop={handleTimerStop} />
                <FeatureSection />
                <HowItWorks />
                <CTASection onSignupClick={() => setShowSignupModal(true)} />
            </main>

            <Footer />

            <SignupModal
                isOpen={showSignupModal}
                onClose={() => setShowSignupModal(false)}
            />
        </div>
    );
}
