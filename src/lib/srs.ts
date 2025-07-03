import type { StudyCard } from './types';

export type SrsPerformance = 'again' | 'good' | 'easy';

const INITIAL_EASE_FACTOR = 2.5;

export function updateSrsData(card: StudyCard, performance: SrsPerformance): StudyCard {
    const now = new Date().toISOString();
    let { 
        interval = 0, 
        easeFactor = INITIAL_EASE_FACTOR, 
        repetitions = 0 
    } = card.srs || {};

    if (performance === 'again') {
        repetitions = 0;
        interval = 1;
    } else {
        repetitions += 1;
        if (repetitions === 1) {
            interval = 1;
        } else if (repetitions === 2) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }

        // Adjust ease factor based on performance
        if (performance === 'good') {
            // No change to ease factor
        } else if (performance === 'easy') {
            easeFactor += 0.15;
        }
    }
    
    // Ensure ease factor doesn't go below 1.3
    easeFactor = Math.max(1.3, easeFactor);

    return {
        ...card,
        srs: {
            interval,
            easeFactor,
            repetitions,
            lastReviewed: now,
        }
    };
}

export function getDueDate(card: StudyCard): Date {
    if (!card.srs?.lastReviewed) {
        const now = new Date();
        now.setHours(0,0,0,0);
        return now; // New cards are due immediately
    }
    const lastReviewed = new Date(card.srs.lastReviewed);
    const dueDate = new Date(lastReviewed.setDate(lastReviewed.getDate() + card.srs.interval));
    dueDate.setHours(0,0,0,0);
    return dueDate;
}
