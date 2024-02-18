# Big City Bias: Evaluating the Impact of Metropolitan Size on Computational Job Market Abilities of Language Models

<img src="./.readme/header.png"/>
Code for the corresponding paper submitted to the NLP4HR Workshop at EACL 2024

## Abstract

Large language models have emerged as a useful technology for job matching, for both candidates and employers. Job matching is often based on a particular geographic location, such as a city or region. However, LMs have known biases, commonly derived from their training data. In this work, we aim to quantify the metropolitan size bias encoded within large language models, evaluating zero-shot salary, employer presence, and commute duration predictions in 384 of the United States’ metropolitan regions. Across all benchmarks, we observe correlations between metropolitan population and the accuracy of predictions, with the smallest 10 metropolitan regions showing upwards of 300% worse benchmark performance than the largest 10.

## System Requirements

_Note: MacOS is the preferred development environment._

1. [NodeJS](https://nodejs.org/en/): `brew install node`
2. [NPM](https://www.npmjs.com/): Included with Node installation
3. An internet browser (visualization only)

## Quick Start

_Note: Run commands from the project root_

Install dependencies:
```
    npm install
```

Render in-browser visualizations:
```
    npm run viz
```

Render PDF visualizations:
```
    python3 viz/data.py && python3 viz/correlation.py  
```

## Running Evaluations

To re-run evaluations, configure the `.env` file as follows:

```
    CACHE="FALSE"
    OPENAI_API_KEY="<YOUR_KEY_HERE>"
    REPLICATE_API_KEY="<YOUR_KEY_HERE>"
```

You can then run:
```
    npm run eval:viz
```

_Note: You must provide your own salary data in `data/metro/us_metro_salary.csv`_

_Note: A complete evaluation fires thousands of completion requests to each model. Use at your own (financial) risk!_

## Project Structure

* `/cache` => contains cached evaluation outputs with a file for each model (e.g `evaluation-gpt-3.5-turbo.json`)
* `/data/metro` => contains CSV data sources for evaluations (e.g `us_metro_commute.csv`)
* `/src/index.ts` => root evaluation file, everything starts here
* `/src/Analysis.ts` => statistical evaluation of evaluation output. Writes to `viz/data.json` for visualization.
* `/viz` => contains browser and pdf visualization files. All charts render data from `viz/data.json`.

TODO: Describe visualizations

## Data Sources
* `data/metro/us_metro_commute.csv`: Commute `origin`, `destination`, and `duration` data obtained via the [Google Maps Platform](https://developers.google.com/maps). See [util/createCommuteDataset.ts](https://github.com/charlie-campanella/big-city-bias/blob/main/src/util/createCommuteDataset.ts) to learn more.
* `data/metro/us_metro_employers.csv`: People Data Labs, ["Top Employers by US Metro"](https://docs.peopledatalabs.com/docs/people-data-labs-free-dataset-top-employers-by-us-metro#license)
* `data/metro/us_metro_population.csv`: U.S. Census Bureau, ["Annual Resident Population Estimates for Metropolitan and Micropolitan Statistical Areas and Their Geographic Components for the United States: April 1, 2020 to July 1, 2022 (CBSA-EST2022)"](https://www.census.gov/data/datasets/time-series/demo/popest/2020s-total-metro-and-micro-statistical-areas.html)
* `data/metro/us_metro_salary.csv`: Proprietary and confidential to [Indeed.com](https://www.indeed.com/). Data is redacted from public release.
