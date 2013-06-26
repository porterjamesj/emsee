#imports
import plot as pl
from flask import Flask,render_template,request,jsonify
app = Flask(__name__)

@app.route('/',methods=['GET'])
def indexget():
    return render_template('index.html')

@app.route('/drawgraph2d')
def drawgraph2d():
    plot = pl.TwoDeePlot(request.args.get('eq',type=str),
                         {i:request.args.get(i,type=float)
                          for i in request.args if not i == 'eq'})
    plot.evaluate()
    plot.sample()
    return jsonify(plot.toclient())

@app.route('/drawgraph')
def drawgraph():
    plot = pl.OneDeePlot(request.args.get('eq',type=str),
                         {i:request.args.get(i,type=float)
                          for i in request.args if not i == 'eq'})
    plot.evaluate()
    plot.sample()
    return jsonify(plot.toclient())

if __name__ == "__main__":
    app.run(debug = True)
