export const saveToLocalStorage = (key: string, value: any): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error('Failed to save to localStorage:', error)
    }
}

export const getFromLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
    try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : (defaultValue || null)
    } catch (error) {
        console.error('Failed to read from localStorage:', error)
        return defaultValue || null
    }
}

export const removeFromLocalStorage = (key: string): void => {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.error('Failed to remove from localStorage:', error)
    }
}

export const clearLocalStorage = (): void => {
    try {
        localStorage.clear()
    } catch (error) {
        console.error('Failed to clear localStorage:', error)
    }
}
