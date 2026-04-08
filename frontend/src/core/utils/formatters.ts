export const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat('pt-BR').format(
        typeof date === 'string' ? new Date(date) : date
    )
}

export const formatDateTime = (date: string | Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(typeof date === 'string' ? new Date(date) : date)
}

export const truncate = (text: string, length: number): string => {
    return text.length > length ? `${text.substring(0, length)}...` : text
}

export const capitalize = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1)
}
