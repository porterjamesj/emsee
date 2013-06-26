"""Classes for generating plot data."""
import sympy as sy
from sympy.parsing.sympy_parser import parse_expr

class Plot:
    """Generic plot class."""
    def __init__(self, requestdict):
        """Initialization is from the dictionary sent by jQuery."""
        for key in requestdict:
            setattr(self,key,dictionary[key])

        #try to parse the given equation
        try:
            self.exp = parse_expr(self.eq)
        except:
            raise RuntimeError("Equation parsing failed.")

        #validate ranges
        if self.xmin >= self.xmax:
            raise RuntimeError("Invalid range.")
        if hasattr(self,"ymin") and hasattr(self,"ymax"):
        if self.ymin >= self.ymax:
            raise RuntimeError("Invalid range.")

class OneDeePlot(Plot):
    """One dimensional plot class."""
    def evaluate(self):
