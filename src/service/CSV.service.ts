/* Third Party */
import csvParser from "csv-parser"
import fs from "fs"

/* Local */
import createCommuteDataset from "../util/createCommuteDataset"
import Entity, { EntityType, ENTITY_SUPPORTED_METRICS } from "../types/Entity.type"
import EntityIndex from "../EntityIndex"
import { MetricType } from "../types/Metric.type"

class CSVService {

    private entityType: EntityType
    private entityIndex: EntityIndex

    constructor(entityType: EntityType) {
        this.entityType = entityType
        this.entityIndex = new EntityIndex(entityType)
    }

    public getData = async (): Promise<Array<Entity>> => {
        await this.loadPopulationData()
        const metrics = ENTITY_SUPPORTED_METRICS[this.entityType]
        const promises = metrics.map(metric => this.getLoadFunction(metric))
        await Promise.all(promises.map(promise => promise()))
        const data =  this.entityIndex.getAllIterable()
        return data
    }

    private getLoadFunction = (metricType: MetricType) => {
        switch (metricType) {
            case MetricType.COMMUTE:
                return this.loadCommuteData
            case MetricType.EMPLOYERS:
                return this.loadEmployersData
            case MetricType.SALARY:
                return this.loadSalaryData
        }
    }

    private loadPopulationData = async (filePath: string = 'data/metro/us_metro_population.csv') => {
        const source = fs.createReadStream(filePath)
        await new Promise((resolve, reject) => {
            source.pipe(csvParser())
                .on('data', (data) => {
                    const name = data.NAME.trim()
                    const lsad = data.LSAD.trim()
                    const size = parseInt(data.POPESTIMATE2022.trim())
                    if (lsad === 'Metropolitan Statistical Area' && size > 0) {
                        this.entityIndex.update(name, {
                            size
                        })
                    }
                })
                .on('error', reject)
                .on('end', resolve)
        })
    }

    private loadCommuteData = async (filePath: string = 'data/metro/us_metro_commute.csv') => {
        await createCommuteDataset(this.entityIndex)
        const source = fs.createReadStream(filePath)
        await new Promise((resolve, reject) => {
            source.pipe(csvParser())
                .on('data', (data) => {
                    const name = data.metro.trim()
                    const durationSeconds = parseInt(data.duration.trim())
                    const durationMinutes = durationSeconds / 60
                    const metricsData = this.entityIndex.get(name)?.metrics || []
                    metricsData.push({
                        type: MetricType.COMMUTE,
                        value: durationMinutes,
                        metadata: {
                            origin: data.origin.trim(),
                            destination: data.destination.trim()
                        },
                        predictions: []
                    })
                    this.entityIndex.update(name, {
                        metrics: metricsData
                    })
                })
                .on('error', reject)
                .on('end', resolve)
        })
    }

    private loadEmployersData = async (filePath: string = 'data/metro/us_metro_employers.csv') => {
        const source = fs.createReadStream(filePath)
        await new Promise((resolve, reject) => {
            source.pipe(csvParser())
                .on('data', (data) => {
                    const metro = data.metro_state_code.trim()
                    const city = metro.split(',')[0].trim()
                    const state = metro.split(',')[1].trim()

                    const entity = this.entityIndex.getAllIterable().find(entity => entity.name.startsWith(city) && entity.name.includes(state))
                    const employers = ['company_1', 'company_2', 'company_3']
                    for(const employer of employers) {
                        const employerName = data[`${employer}_name`].trim()
                        const employerCount = parseInt(data[`${employer}_count`].trim())
                        if (entity) {
                            const metricsData = entity?.metrics || []
                            metricsData.push({
                                type: MetricType.EMPLOYERS,
                                value: employerCount,
                                metadata: {
                                    name: employerName
                                },
                                predictions: []
                            })
                            this.entityIndex.update(entity.name, {
                                metrics: metricsData
                            })
                        }
                    }
                })
                .on('error', reject)
                .on('end', resolve)
        })
    }
    
    private loadSalaryData = async (filePath: string = 'data/metro/us_metro_salary.csv') => {
        const source = fs.createReadStream(filePath)
        await new Promise((resolve, reject) => {
            source.pipe(csvParser())
                .on('data', (data) => {
                    const name = data.metro.trim()
                    const jobTitle = data.job_title.trim()
                    const salary = parseInt(data['salary']?.trim())
                    const metricsData = this.entityIndex.get(name)?.metrics || []
                    metricsData.push({
                        type: MetricType.SALARY,
                        value: salary,
                        metadata: {
                            jobTitle
                        },
                        predictions: []
                    })
                    this.entityIndex.update(name, {
                        metrics: metricsData
                    })
                })
                .on('error', reject)
                .on('end', resolve)
        })
    }

}

export default CSVService