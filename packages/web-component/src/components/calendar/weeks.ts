export type Weeks = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const weekKey: Weeks[] = [
    'sun',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat'
];
export const getWeekInOrder = (startAt?: Weeks | null) => {
    if (!startAt) startAt = 'sun';
    const index = weekKey.indexOf(startAt);
    if (index === -1) return weekKey;
    return [...weekKey.slice(index), ...weekKey.slice(0, index)];
};
