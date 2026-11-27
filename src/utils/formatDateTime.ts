const month: Record<number, string> = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'Mei',
    5: 'Jun',
    6: 'Jul',
    7: 'Agu',
    8: 'Sep',
    9: 'Okt' ,
    10: 'Nov',
    11: 'Des'   
}

export function formatDate(date: Date | undefined): string | undefined {
    if (!date) return

    // Switch time to tomorrow, today, or yesterday
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
        return 'Hari ini'
    }
    if (date.toDateString() === tomorrow.toDateString()) {
        return 'Besok'
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Kemarin'
    }

    return `${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()}`
}

export function formatTime(date: Date | undefined): string | undefined {
    if (!date) return

    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

export function formatDateTime(date: Date | undefined): string | undefined {
    if (!date) return

    return `${formatDate(date)} • ${formatTime(date)}`
}
