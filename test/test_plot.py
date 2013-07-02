from nose.tools import raises, with_setup
import plot as pl
import sympy as sy

def test_parse_expr():
    """Plot should parse expressions successfully."""
    myplot = pl.Plot("cos(x)",{"xmin":0,"xmax":5})
    assert isinstance(myplot.exp,sy.functions.elementary.trigonometric.cos)


@raises(RuntimeError)
def test_bounds_check_x():
    """Bounds checking in x should work."""
    myplot = pl.Plot("cos(x)",{"xmin":10,"xmax":5})

@raises(RuntimeError)
def test_bounds_check_y():
    """Bounds checking in y should work."""
    myplot = pl.Plot("cos(x)",{"xmin":0,"xmax":5,
                               "ymin":10,"ymax":5})

# OneDeePlot

def test_evaluate_ondee():
    """OneDeePlots should evaluate correctly."""
    myplot = pl.OneDeePlot("cos(x)",{"xmin":0,"xmax":1})
    myplot.evaluate(5)
    assert myplot.points == [(0.0, 1.0),
                             (0.20000000000000001, 0.9800665778412416),
                             (0.40000000000000002, 0.9210609940028851),
                             (0.60000000000000009, 0.8253356149096782),
                             (0.80000000000000004, 0.6967067093471654)]

def test_sample_onedee():
    """OneDeePlot sampling should be in the correct range."""
    myplot = pl.OneDeePlot("cos(x)",{"xmin":0,"xmax":1})
    myplot.evaluate()
    myplot.sample()
    assert len(myplot.chain) == 1000
    for point in myplot.chain:
        assert 0 < point < 1

#TwoDeePlot

def test_evaluate_twodee():
    """TwoDeePlot should evaluate correctly."""
    myplot = pl.TwoDeePlot("x + y",{"xmin":0,"xmax":1,
                                    "ymin":0,"ymax":1})
    myplot.evaluate(3,3)
    assert myplot.zs == [[0.0, 0.3333333333333333, 0.6666666666666666],
                         [0.3333333333333333, 0.6666666666666666, 1.0],
                         [0.6666666666666666, 1.0, 1.3333333333333333]]

def test_sample_twodee():
    """TwoDeePlot sampler should be in the correct range."""
    myplot = pl.TwoDeePlot("x + y",{"xmin":0,"xmax":1,
                                    "ymin":0,"ymax":1})
    myplot.evaluate()
    myplot.sample()
    assert len(myplot.chain) == 1000
    for point in myplot.chain:
        assert 0 < point[0] < 1
        assert 0 < point[1] < 1
