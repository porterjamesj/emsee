#imports
from __future__ import division
import sympy as sy
import numpy as np
import emcee
from sympy.parsing.sympy_parser import parse_expr

from flask import Flask,render_template,request,jsonify
app = Flask(__name__)

@app.route('/',methods=['GET'])
def indexget():
    return render_template('index.html')

@app.route('/2d',methods=['GET'])
def indexget():
    return render_template('index2d.html')

@app.route('/drawgraph2d')
def drawgraph2d():
    data = {}

    # use sympy to parse the equation into something we can evaluate
    try:
        exp = parse_expr(request.args.get('eq',type=str))
    except:
        return jsonify(error = "parse error")

    data['xmin']= xmin = request.args.get('minx',type=float)
    data['xmax']= xmax = request.args.get('maxx',type=float)
    data['ymin']= ymin = request.args.get('miny',type=float)
    data['ymax']= ymax = request.args.get('maxy',type=float)

    data['xsteps'] = 100
    data['ysteps'] = 100
    
    stepsizex = (xmax - xmin)/data['xsteps']
    stepsizey = (ymax - ymin)/data['ysteps']

    # symbols for sympy
    x = sy.Symbol('x')
    y = sy.Symbol('y')

    data['xs'] = list(np.arange(xmin, xmax, stepsizex))
    data['ys'] = list(np.arange(ymin, ymax, stepsizey))
    
    try:
        data['zs'] = [[float(exp.evalf(subs={x:i,y:j}))
                           for j in data['ys']]
                           for i in data['xs']]
    except Exception as err:
        return jsonify(error = str(err))

    # extract min and max z value
    data['zmin'] = min([min(row) for row in data['zs']])
    data['zmax'] = max([max(row) for row in data['zs']])

    # sample the distribution

    # guess resonable covariance matrix
    xvar = (xmax-xmin)/10
    yvar = (ymax-ymin)/10
    cov = np.array([[xvar,0],[0,yvar]])

    numsamples = 1000

    def lnprobfn(state):
        if state[0] > xmax or state[0] < xmin or state[1] > ymax or state[1] < ymin:
            return -np.inf
        res = float(exp.evalf(subs={x:float(state[0]),y:float(state[1])}))
        return np.log( 1/((res-data['zmin'])**2) )

    sampler = emcee.MHSampler(cov, 2, lnprobfn)

    initstate = np.concatenate((
        np.random.uniform(xmin,xmax,1),
        np.random.uniform(ymin,ymax,1)
        ))

    res = sampler.run_mcmc(initstate,numsamples)
    data['chain'] = sampler.chain.tolist()
    
    return jsonify(**data)
    
@app.route('/drawgraph')
def drawgraph():
    # use sympy to parse The equation into something we can evaluate
    try:
        exp = parse_expr(request.args.get('eq',type=str))
    except:
        return jsonify(error = "parse error")

    xmin = request.args.get('minx',type=float)
    xmax = request.args.get('maxx',type=float)

    if xmin >= xmax:
        return jsonify(error = "invalid range")
    
    stepsize = (xmax - xmin) / 1000

    x = sy.Symbol('x')
    
    # evaluate over the range
    try:
        points = [(i,float(exp.evalf(subs={x:i})))
                    for i in np.arange(xmin,
                                       xmax,
                                       stepsize)]
    except:
        return jsonify(error = "evalf error")

    #compute minimum/maximum for the sampler
    ymin = min(zip(*points)[1])
    ymax = max(zip(*points)[1])
    yrange = ymax - ymin
    
    # use emcee to sample the distribution

    # guess a reasonable variance
    var = (xmax-xmin)/10
    
    numsamples = 1000; # number of samples to take
    
    def lnprobfn(xarg):
        if xarg[0] > xmax or xarg[0] < xmin:
            # We are outside the acceptable range, probability = 0
            return -np.inf
        res = float(exp.evalf(subs={x:float(xarg[0])}))
        return np.log( 1/((res - ymin)**2) )
        

    sampler = emcee.MHSampler([[var,var],[var,var]], #cov
                              2, #dim
                              lnprobfn)

    initval = float(np.random.uniform(xmin,xmax,1))
    res = sampler.run_mcmc([initval,initval],numsamples)
    
    chain = zip(*sampler.chain)[0]
    
    return jsonify(points = points,
                   word = "jQuery",
                   xmin = xmin,
                   xmax = xmax,
                   chain = chain,
                   numsamples = numsamples)

@app.route('/',methods=['POST'])
def indexpost():

    # should definitely add some sanity checks here before trying to plot
    
    # generate parameters for svg and render
    return render_template('return.html',plot = plot.svgout())

if __name__ == "__main__":
    app.run(debug = True)
