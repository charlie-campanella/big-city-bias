/* Third Party */
import * as fs from 'node:fs'

/* Local */
import GoogleMapsService, { Commute } from '../service/GoogleMaps.service'
import { EntityType } from '../types/Entity.type'
import EntityIndex from '../EntityIndex'

const createCommuteDataset = async (entityIndex: EntityIndex) => {
    const commuteDataExists = fs.existsSync(`${__dirname}/../../data/metro/us_metro_commute.csv`)
    console.log('Creating commute dataset...')
    console.log('metro,origin,destination,duration')
    if (!commuteDataExists) {
        let commuteDataCSV: string = 'metro,origin,destination,duration\n'
        const metroEntities = entityIndex.getAllIterable().filter(entity => entity.type === EntityType.METRO)
        const googleMapsService = new GoogleMapsService()
        for (const metro of metroEntities) {
            const commutes: Array<Commute> = await googleMapsService.generateRandomCommutes(metro.name)
            for (const commute of commutes) {
                if (commute.duration !== -1) {
                    const origin = commute.origin.name.replace('"', '')
                    const destination = commute.destination.name.replace('"', '')
                    const csvLine = `"${metro.name}", "${origin}","${destination}",${commute.duration}\n`
                    console.log(csvLine)
                    commuteDataCSV += csvLine
                }
            }
        }
        fs.writeFileSync(`${__dirname}/../../data/metro/us_metro_commute.csv`, commuteDataCSV)
    }
    return
}

export default createCommuteDataset