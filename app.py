#imports
import sympy as sy
import numpy as np
from plot import Plot
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

    #make a plot object
    limits = (-20,20)
    plotsize = (400,400)
    offset = 50
    
    plot = Plot(exp,limits,plotsize,offset)

    params = plot.svgout()
    
    return jsonify(datastring = params['datastring'],
                   svgsize = params['svgsize'],
                   xaxis = params['xaxis'],
                   yaxis = params['yaxis'],
                   word = "cats")


@app.route('/',methods=['POST'])
def indexpost():

    # should definitely add some sanity checks here before trying to plot
    
    # generate parameters for svg and render
    return render_template('return.html',plot = plot.svgout())

if __name__ == "__main__":
    app.run(debug = True)
