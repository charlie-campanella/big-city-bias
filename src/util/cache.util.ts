/* Third Party */
import * as fs from 'node:fs'

const cacheData = (file: string, data: any) => {
    fs.writeFileSync(`${__dirname}/../../cache/${file}`, JSON.stringify(data))
}

const loadCachedData = (file: string): any => {
    const FILE_PATH = `${__dirname}/../../cache/${file}`
    try {
        const raw = fs.readFileSync(FILE_PATH).toString()
        const parsed: any = JSON.parse(raw.toString())
        return parsed
    } catch (e) {
        fs.writeFileSync(FILE_PATH, JSON.stringify('{}'))
        return {}
    }
}

export { cacheData, loadCachedData }