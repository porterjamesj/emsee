#imports
import plot as pl
from flask import Flask,render_template,request,jsonify
app = Flask(__name__)

@app.route('/',methods=['GET'])
def indexget():
    return render_template('index.html')

@app.route('/drawgraph2d')
def drawgraph2d():
    data = {}

    print request.args

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
    plot = pl.OneDeePlot(request.args.get('eq',type=str),
                         {i:request.args.get(i,type=float)
                          for i in request.args if not i == 'eq'})
    plot.evaluate(1000)
    plot.sample(1000,10)
    return jsonify(plot.toclient())

if __name__ == "__main__":
    app.run(debug = True)
