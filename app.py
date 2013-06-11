#imports
import sympy as sy
import numpy as np
from plot import Plot
from sympy.parsing.sympy_parser import parse_expr

from flask import Flask,render_template,request
app = Flask(__name__)

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

    #make a plot object

    plot = Plot(exp,(-5,10),(200,200),20)
    
    # generate parameters for svg and render
    return render_template('return.html',plot = plot.svgout())

if __name__ == "__main__":
    app.run(debug = True)
