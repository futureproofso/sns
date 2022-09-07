const BASE_64_REGEX = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\/]{3}=)?'

export function isBase64(text: string): boolean {
    return (new RegExp('^' + BASE_64_REGEX + '$', 'gi')).test(text)
}

export function chunk(text: string, size: number): Array<string> {
    if (text.length < size) {
        return [text.padEnd(size)]
    }

    let pad = text.length % size
    if (pad > 0) {
        pad = size - pad
        text = text.padEnd(text.length + pad)
    }

    let count = Math.floor(text.length / size)
    const chunks = new Array<string>(count)

    let cursor = 0;
    for (let i = 0; i < count; i++) {
        chunks[i] = text.substring(cursor, cursor + size)
        cursor += size
    }
    return chunks
}
