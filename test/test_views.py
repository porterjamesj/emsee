from app import app,buildjson
import plot as pl

def test_buildjson():
    """Test that the buildjson method works correctly. This is not really
    a unit test, should I maybe monkey patch the constructor?"""
    with app.test_request_context('/?eq=^^^&xmin=-10&xmax=10&dim=1'):
        assert "\"errcode\": 0" in buildjson(pl.OneDeePlot).data
    with app.test_request_context('/?eq=log(x)&xmin=-10&xmax=10&dim=1'):
        assert "\"errcode\": 1" in buildjson(pl.OneDeePlot).data
    with app.test_request_context('/?eq=cos(x)&xmin=-10&xmax=10&dim=1'):
        assert "\"xmin\": -10" in buildjson(pl.OneDeePlot).data
