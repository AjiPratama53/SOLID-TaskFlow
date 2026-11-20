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

export function daysInterval(date:Date | undefined): number | undefined{ 
    if (!date) return

    return Math.ceil((date.getTime() - Date.now()) / (1000 * 3600 * 24))
}

export function formatDate(date: Date | undefined): string | undefined {
    if (!date) return

    switch (daysInterval(date)){
        case 0: return 'Hari ini'
        case 1: return 'Besok'
        case -1: return 'Kemarin'
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
