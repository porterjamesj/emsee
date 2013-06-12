#imports
import sympy as sy
import numpy as np
from sympy.parsing.sympy_parser import parse_expr

from flask import Flask,render_template,request,jsonify
app = Flask(__name__)

@app.route('/',methods=['GET'])
def indexget():
    return render_template('index.html')


@app.route('/drawgraph')
def drawgraph():
    # use sympy to parse the equation into something we can evaluate
    try:
        exp = parse_expr(request.args.get('eq',type=str))
    except:
        return render_template('error.html')

    xmin = -20
    xmax = 20
    stepsize = 0.5

    x = sy.Symbol('x')
    
    # evaluate over the range
    points = [(i,float(exp.evalf(subs={x:i})))
                    for i in np.arange(xmin,
                                       xmax,
                                       stepsize)]

    return jsonify(points = points, 
                   word = "cats",
                   xmin = xmin,
                   xmax = xmax)

@app.route('/',methods=['POST'])
def indexpost():

    # should definitely add some sanity checks here before trying to plot
    
    # generate parameters for svg and render
    return render_template('return.html',plot = plot.svgout())

if __name__ == "__main__":
    app.run(debug = True)
