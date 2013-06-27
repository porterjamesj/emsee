#imports
import plot as pl
from flask import Flask,render_template,request,jsonify
app = Flask(__name__)

@app.route('/',methods=['GET'])
def indexget():
    return render_template('index.html')

@app.route('/drawgraph')
def drawgraph():
    # figure out correct constructor
    if request.args.get('dim',type=int) == 1:
        constructor = pl.OneDeePlot
    elif request.args.get('dim',type=int) == 2:
        constructor = pl.TwoDeePlot
    #construct plot object
    plot = constructor(request.args.get('eq',type=str),
                         {i:request.args.get(i,type=float)
                          for i in request.args if not i in ['eq','dim']})
    # compute plot data and send back to client
    plot.evaluate()
    plot.sample()
    return jsonify(plot.toclient())

if __name__ == "__main__":
    app.run(debug = True)
