/* Third Party */
import * as ss from 'simple-statistics'
import * as fs from 'node:fs'

/* Local */
import { AIModel } from './types/AIService.type'
import Entity, { EntityType, ENTITY_SUPPORTED_METRICS } from "./types/Entity.type"
import { MetricType } from './types/Metric.type'

type AnalysisResult = {
    name: string,
    values: {
        x: number[],
        y: number[],
        regression: {
            x: number[],
            y: number[]
        }
    },
    stats: {
        correlation: number,
        regression: {
            m: number,
            b: number,
        },
        rSquared: number,
        pValue: number,
        yCount: number,
        yMean: number,
        yMedian: number,
        topTenAvg: number,
        bottomTenAvg: number,
    },
    plot: {
        labels: string[],
        xaxis: {
            title: string,
        },
        yaxis: {
            title: string,
        }
    }
}

class Analysis {

    public results: AnalysisResult[] = []

    public run(model: AIModel, entityType: EntityType, entities: Entity[]): AnalysisResult[] {
        console.log(`Analyzing ${entityType} with ${model}`)
        const metricTypes: MetricType[] = ENTITY_SUPPORTED_METRICS[entityType]
        for(const metricType of metricTypes) {
            this.analyzeMetric(metricType, entities)
        } 
        this.writeAnalysisResults(model)
        return this.results
    }

    private analyzeMetric(metricType: MetricType,  entities: Entity[]) {
        const plotTitle: string = `LLM-Predicted ${metricType} Error vs. log(size)`
        const xTitle: string = 'log(size)'
        const yTitle: string = `${metricType} Error (%)`

        var x: number[] = entities.map(entity => Math.log(entity.size))
        var y: number[] = entities.map(entity => this.entityMetricMeanError(entity, metricType))
        var labels: string[] = entities.map(entity => entity.name)

        // Non-numeric values
        var { x, y, labels } = this.cleanData(x, y, labels, (yValue) => yValue !== -1 && !isNaN(yValue))

        // Extreme outliers (e.g. 100,000% error)
        const median = ss.median(y)
        var { x, y, labels } = this.cleanData(x, y, labels, (yValue) => Math.abs(yValue) < median * 20)

        // Outliers
        const mean = ss.mean(y)
        const standardDeviation = ss.standardDeviation(y)
        var { x, y, labels } = this.cleanData(x, y, labels, (yValue) => Math.abs(yValue) < mean + (standardDeviation * 3))

        const result = this.createResult(plotTitle, xTitle, x, yTitle, y, labels)
        this.results.push(result)
    }

    private createResult(
        name: string, 
        xTitle: string, 
        x: number[], 
        yTitle: string, 
        y: number[], 
        labels: string[]
    ): AnalysisResult {
        const samples = x.map((x, i) => [x, y[i]]).sort((a, b) => b[0] - a[0])
        const linearRegression = ss.linearRegression(samples)
        const linearRegressionLine = ss.linearRegressionLine(linearRegression)

        const topTenSamples = samples.slice(0, 10)
        const bottomTenSamples = samples.slice(-10)
        const topTenAvg = ss.mean(topTenSamples.map(sample => sample[1]))
        const bottomTenAvg = ss.mean(bottomTenSamples.slice(0, 10).map(sample => sample[1]))

        return {
            name,
            values: {
                x,
                y,
                regression: {
                    x,
                    y: x.map(x => linearRegressionLine(x))
                }
            },
            stats: {
                correlation: y.length > 1 ? ss.sampleCorrelation(x, y) : -1,
                regression: linearRegression,
                rSquared: ss.rSquared(samples, linearRegressionLine),
                pValue: ss.permutationTest(x, y),
                yCount: y.length,
                yMean: ss.mean(y),
                yMedian: ss.median(y),
                topTenAvg,
                bottomTenAvg,
            },
            plot: {
                labels,
                xaxis: {
                    title: xTitle,
                },
                yaxis: {
                    title: yTitle,
                }
            }
        }
    }

    private entityMetricMeanError(entity: Entity, metricType: MetricType): number {
        const errors = entity.metrics.filter(metric => metric.type === metricType).flatMap(metric => metric.predictions.map(prediction => prediction.error))
        if (errors.length === 0) {
            return -1
        }
        const averageError = ss.mean(errors)
        return averageError
    }

    private cleanData(x: number[], y: number[], labels: string[], testFunction: (yValue: number) => boolean): { x: number[], y: number[], labels: string[] } {
        const cleanedX: number[] = []
        const cleanedY: number[] = []
        const cleanedLabels: string[] = []
    
        for(let i = 0; i < y.length; i++) {
            if (testFunction(y[i])) {
                cleanedX.push(x[i])
                cleanedY.push(y[i])
                cleanedLabels.push(labels[i])
            }
        }
    
        return {
            x: cleanedX,
            y: cleanedY,
            labels: cleanedLabels
        }
    }
    
    private writeAnalysisResults(model: AIModel) {
        const ANALYSIS_RESULTS_PATH = `${__dirname}/../viz/data.json`
        const resultsData = fs.readFileSync(ANALYSIS_RESULTS_PATH)
        const currentResults = JSON.parse(resultsData.toString())
        currentResults[model] = this.results
        fs.writeFileSync(ANALYSIS_RESULTS_PATH, JSON.stringify(currentResults))
    }

}

export default Analysis