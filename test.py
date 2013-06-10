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

app.vars = {'height':300,'width':300}

@app.route('/',methods=['GET'])
def indexget():
    return render_template('index.html')

@app.route('/',methods=['POST'])
def indexpost():
    app.vars['eq'] = request.form['equation']
    exp = parse_expr(app.vars['eq'])
    space = np.arange(0,5,0.01)
    evals = [(i,exp.evalf(subs={x:i})) for i in space]
    scaledis = rescale(np.array(zip(*evals)[0]),app.vars['width'])
    scaledvs = rescale(np.array(zip(*evals)[1]),app.vars['height']) 
    strevals = ["{0},{1}".format(i,v) for (i,v) in zip(scaledis,scaledvs)]
    return render_template('return.html',
                           data=strevals,
                           width=app.vars['width'],
                           height=app.vars['height'])
    
if __name__ == "__main__":
    app.run(debug = True)
