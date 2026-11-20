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

const isTomorrow = (date:Date) => date.getDate() - new Date().getDate() === 1 

export function formatDate(date: Date | undefined): string | undefined {
    if (!date) return

    return isTomorrow(date) ? 'Besok' : `${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()}`
}

export function formatTime(date: Date | undefined): string | undefined {
    if (!date) return
    return `${date.getHours()}:${date.getMinutes()}`
}
