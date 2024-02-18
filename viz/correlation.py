import json
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
plt.style.use('viz/rob.mplstyle')

from numpy.polynomial.polynomial import polyfit


data = json.load(open('viz/data.json'))

names = {'gpt-4': 'gpt-4', 'meta:llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0': 'llama-2-7b-chat', 'gpt-3.5-turbo': 'gpt-3.5-turbo', 'meta:llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3': 'llama-2-70b-chat', 'mistralai:mistral-7b-instruct-v0.1:5fe0a3d7ac2852264a25279d1dfb798acbc4d49711d126646594e212cb821749': 'mistral-7b-instruct'}
ordered_lms = ['mistralai:mistral-7b-instruct-v0.1:5fe0a3d7ac2852264a25279d1dfb798acbc4d49711d126646594e212cb821749', 'meta:llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0', 'meta:llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3', 'gpt-3.5-turbo', 'gpt-4']

categories = ['Salary', 'Employment', 'Commute']
import statistics
def removeOutliers(x, y):
    stdev = statistics.stdev(y)
    avg = sum(y)/len(y)
    new_y = []
    new_x = []
    for item_y, item_x in zip(y, x):
        if item_y < avg + 2*stdev and item_y > avg-2*stdev:
            new_y.append(item_y)
            new_x.append(item_x)
    return new_x, new_y

limits = [1000,1000,50]
fig, axs = plt.subplots(3, 5, figsize=(8,5), dpi=300)
import numpy
for lmIdx, lm in enumerate(ordered_lms):
    name = names[lm]
    for categoryIndex in range(len(data[lm])):
        ax = axs[categoryIndex][lmIdx]
        if categoryIndex == 0: 
            ax.set_title(name, fontsize=8)

        x = data[lm][categoryIndex]['values']['x']
        y = data[lm][categoryIndex]['values']['y']

        x, y = removeOutliers(x, y)
        ax.scatter(x,y, s=5)

        b, m = polyfit(x, y, 1)
        x = numpy.array(x)
        ax.plot(x, b + m * x, color='black', linestyle='-', marker='')
        ax.set_xlim((10,17))
        ax.set_ylim((0, limits[categoryIndex]))
        if lmIdx > 0:
            ax.set_yticklabels(['','',''])
        else:
            ax.set_ylabel('Avg. Error (%)', fontsize=8)

        ax.set_xticks([12,15])
        if categoryIndex < 2:
            ax.set_xticklabels(['',''])
        else:
            ax.set_xlabel('log(population)', fontsize=8)

        if lmIdx == 4:
            ax.text(18,-3, categories[categoryIndex], rotation=270)
        

fig.savefig('graph.pdf', bbox_inches='tight')

