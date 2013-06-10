#imports
import sympy as sy
import numpy as np
from sympy.parsing.sympy_parser import parse_expr
import matplotlib.pyplot as plt

from flask import Flask,render_template,request
app = Flask(__name__)


#define x as the symbol we will use.
x = sy.Symbol('x')
#y = sy.Symbol('y')

# functions
def rescale(arr,m):
    '''Rescale a numpy array so that it runs from 0 to m.'''
    slid = arr-arr.min()
    return slid/slid.max() * m

app.vars = {'pheight':300,'pwidth':300,
            'wheight':400,'wwidth':400,
            'offset':50}

# define the space over which we solve
xmax = 10.
xmin = -5.
xstep = (xmax-xmin)/(xmax*100)

@app.route('/',methods=['GET'])
def indexget():
    return render_template('index.html')

@app.route('/',methods=['POST'])
def indexpost():
    app.vars['eq'] = request.form['equation']

    # use sympy to parse the equation into something we can evaluate
    try:
        exp = parse_expr(app.vars['eq'])
    except:
        return render_template('error.html')

    # setup a space to solve over, then evaluate
    space = np.arange(xmin,xmax,xstep)
    evals = [(i,exp.evalf(subs={x:i})) for i in space]

    # rescale the results to the size of the plot
    scaledis = rescale(np.array(zip(*evals)[0]),app.vars['pwidth'])
    scaledvs = rescale(np.array(zip(*evals)[1]),app.vars['pheight'])

    # apply an offset so we don't run into the edge of the svg
    scaledis += app.vars['offset']
    scaledvs += app.vars['offset']

    # generate string for svg and render
    strevals = ["{0},{1}".format(i,v) for (i,v) in zip(scaledis,scaledvs)]
    return render_template('return.html',
                           data=strevals,
                           wwidth=app.vars['wwidth'],
                           wheight=app.vars['wheight'],
                           pheight=app.vars['pheight'],
                           pwidth=app.vars['pwidth'],
                           xmax=xmax,
                           xmin=xmin,
                           ymax=round(max(zip(*evals)[1])),
                           ymin=round(min(zip(*evals)[1])),
                           offset=app.vars['offset'])

if __name__ == "__main__":
    app.run(debug = True)
