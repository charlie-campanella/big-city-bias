import csv
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
#plt.style.use('viz/rob.mplstyle')


def readCSV(path):
    with open(path, encoding='utf-8') as csvfile:
        spamreader = csv.reader(csvfile)
        data = [row for row in spamreader][1:]
        return data

pop_data = readCSV('data/metro/us_metro_population.csv')

population = {}
for instance in pop_data:
    if instance[4] == 'Metropolitan Statistical Area':
        population[instance[3]] = [int(instance[8]), 0.0, 0.0, 0.0]


sal_data = readCSV('data/metro/us_metro_salary.csv')
for instance in sal_data:
    city = instance[0]
    if city not in population:
        pass
        #print(instance)
    else:
        population[city][1] = float(instance[2])

def findCity(name, options):
    for option in options:
        if option.startswith(name):
            return option
    
    for option in options:
        if option.lower().startswith(name.split(',')[0].lower()):
            return option
    return name

empl_data = readCSV('data/metro/us_metro_employers.csv')
for instance in empl_data:
    total = 0
    for index in [15,21,27,33,39,45,51,57,63]:
        total += int(instance[index])
    city = instance[2]
    if city not in population:
        city = findCity(city, population.keys())
    population[city][2] = total / 9

com_data = readCSV('data/metro/us_metro_commute.csv')
com_totals = {}
for instance in com_data:
    city = instance[0]
    if city not in com_totals:
        com_totals[city] = []
    com_totals[city].append(int(instance[-1]))
for city in com_totals:
    population[city][3] = sum(com_totals[city])/len(com_totals[city])


fig, axs = plt.subplots(2, 2, figsize=(8,5), dpi=300)
count_variables = ['# humans', 'avg. $', 'avg. # employees', '# seconds']
for varIdx, name, ylabelname in zip([0,1,2,3], ['Population', 'Salary', 'Employer Presence', 'Commute Duration'], count_variables):
    data = []
    for city in population:
        if population[city][varIdx] != 0.0:
            data.append(population[city][varIdx])

    print(name, data[:5], data[-5:])
    ax = axs[int(varIdx/2), int(varIdx%2)]
    if int(varIdx/2) == 1:
        ax.set_xlabel('# metropolitan areas', fontsize=11)
    else:
        ax.set_xticklabels(['','','','',''])
    ax.set_ylabel(ylabelname)
    ax.plot(range(len(data)), sorted(data), linestyle='-', marker='')
    ax.set_title(name)
    ax.set_xlim((0,400))
fig.tight_layout()
fig.savefig('data.pdf', bbox_inches='tight')

from scipy import stats
scores = []
for src_index in range(4):
    scores.append([])
    for tgt_index in range(4):
        var1 = []
        var2 = []
        for city in population:
            var1.append(population[city][src_index])
            var2.append(population[city][tgt_index])
        pearson = stats.pearsonr(var1, var2)[0]
        scores[-1].append(pearson)
print(scores)
fig, ax = plt.subplots(figsize=(8,5), dpi=300)
cmap = mpl.cm.YlGn
im = ax.imshow(scores, cmap=cmap)
    #norm=mpl.colors.TwoSlopeNorm(
    #    vmin=0, vcenter=15, vmax=100
    #))
labels = ['Population', 'Salary', 'Employer Presence', 'Commute']
ax.set_xticks(range(len(labels)))
ax.set_xticklabels(labels)
ax.set_yticks(range(len(labels)))
ax.set_yticklabels(labels)
plt.setp(ax.get_yticklabels(), rotation=45, ha="right",rotation_mode="anchor")

for i in range(len(scores)):
    for j in range(len(scores)):
        text = ax.text(j, i, '{:.3f}'.format(scores[i][j]),
                    ha="center", va="center", fontsize=13)

fig.savefig('correlation-data.pdf', bbox_inches='tight')

