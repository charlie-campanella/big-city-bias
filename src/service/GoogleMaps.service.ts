/* Third Party */
import { Client, LatLngLiteral, PlacesNearbyRanking, TravelMode } from '@googlemaps/google-maps-services-js'

type Place = {
    name: string
    latlng: string
}

type Commute = {
    origin: Place
    destination: Place
    duration: number
}

class GoogleMapsService {

    private client: Client

    constructor() {
        this.client = new Client()
    }

    public generateRandomCommutes = async (metro: string): Promise<Array<Commute>> => {
        const commutes: Array<Commute> = await this.getRandomCommutes(metro)
        for (const commute of commutes) {
            if (commute.origin.name && commute.destination.name) {
                commute.duration = await this.getCommuteDuration(commute)
            } else {
                commute.duration = -1
            }
        }
        return commutes
    }

    private getRandomCommutes = async (metro: string): Promise<Array<Commute>> => {
        const commutes: Array<Commute> = []

        // Get metro geolocation
        const geocodeResponse = await this.client.geocode({
            params: {
                address: metro,
                key: process.env.GOOGLE_MAPS_API_KEY || ''
            }
        })
        const metroLocation = geocodeResponse.data.results[0].geometry.location

        // Get nearby locations
        const nearbyAttractions = await this.getNearbyResults(metroLocation, 'tourist_attraction')
        const nearbyAirports = await this.getNearbyResults(metroLocation, 'airport')
        const nearbyUniversities = await this.getNearbyResults(metroLocation, 'university')

        const firstAttraction: Place = this.getPlaceFromNearbyResults(nearbyAttractions, 0)
        const secondAttraction: Place = this.getPlaceFromNearbyResults(nearbyAttractions, 1)
        const thirdAttraction: Place = this.getPlaceFromNearbyResults(nearbyAttractions, 2)

        const firstAirport: Place = this.getPlaceFromNearbyResults(nearbyAirports, 0)
        const firstUniversity: Place = this.getPlaceFromNearbyResults(nearbyUniversities, 0)

        commutes.push({ origin: firstAttraction, destination: firstAirport, duration: -1 })
        commutes.push({ origin: secondAttraction, destination: firstUniversity, duration: -1 })
        commutes.push({ origin: thirdAttraction, destination: firstAttraction, duration: -1 })
        commutes.push({ origin: firstUniversity, destination: firstAirport, duration: -1 })
        commutes.push({ origin: firstAirport, destination: thirdAttraction, duration: -1 })

        return commutes
    }

    private getNearbyResults = async (metroLocation: LatLngLiteral, type: string): Promise<any> => {
        const nearby = await this.client.placesNearby({
            params: {
                location: metroLocation,
                radius: 20000,
                key: process.env.GOOGLE_MAPS_API_KEY || '',
                rankby: PlacesNearbyRanking.prominence,
                type
            }
        })
        const nearbyResults = nearby.data.results.filter(result => result.name !== undefined)
        return nearbyResults
    }

    private getPlaceFromNearbyResults = (nearbyResults: Array<any>, index: number): Place => {
        const nearbyResult = nearbyResults[index]
        const nearbyLocation = nearbyResult?.geometry?.location || { lat: 0, lng: 0 }
        const place: Place = {
            name: nearbyResult?.name || '',
            latlng: `${nearbyLocation.lat},${nearbyLocation.lng}`,
        }
        return place
    }

    private getCommuteDuration = async (commute: Commute): Promise<number> => {
        const directionsResponse = await this.client.directions({
            params: {
                origin: commute.origin.latlng,
                destination: commute.destination.latlng,
                key: process.env.GOOGLE_MAPS_API_KEY || '',
                mode: TravelMode.driving,
                departure_time: 'now'
            }
        })
        const duration = directionsResponse.data.routes[0]?.legs[0]?.duration.value || -1
        return duration
    }
}

export default GoogleMapsService
export type { Commute, Place }