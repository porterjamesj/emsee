#imports
import plot as pl
from flask import Flask,render_template,request,jsonify
app = Flask(__name__)

def buildjson(constructor):
    #construct plot object
    try:
        plot = constructor(request.args.get('eq',type=str),
                           {i:request.args.get(i,type=float)
                            for i in request.args if not i in ['eq','dim']})
    except:
        return jsonify({"message":"parse error",
                        "errcode":0})

    # compute plot data and send back to client
    try:
        plot.evaluate()
    except:
        return jsonify({"message":"evaluation error",
                         "errcode":1})
    plot.sample()
    return jsonify(plot.toclient())

@app.route('/',methods=['GET'])
def indexget():
    return render_template('index.html')

@app.route('/graph/1d')
def drawgraph():
    return buildjson(pl.OneDeePlot)

@app.route('/graph/2d')
def drawgraph2d():
    return buildjson(pl.TwoDeePlot)


if __name__ == "__main__":
    app.run(debug = True)
