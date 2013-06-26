"""Classes for generating plot data."""
import numpy
import sympy as sy
import emcee
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

        self.ymin = min(zip(*self.points)[1])
        self.ymax = max(zip(*self.points)[1])

        #validate ranges
        if self.xmin >= self.xmax:
            raise RuntimeError("Invalid range.")
        if hasattr(self,"ymin") and hasattr(self,"ymax"):
        if self.ymin >= self.ymax:
            raise RuntimeError("Invalid range.")

class OneDeePlot(Plot):
    """One dimensional plot class."""
    def evaluate(self):
        try:
            self.points = [(i,float(self.exp.evalf(subs={Symbol('x'):i})))
                           for i in np.arange(self.xmin,
                                              self.xmax,
                                              self.stepsize)]
        except:
            raise RuntimeError("Evaluation failed.")


    def lnprobfn(self,pos):
        """Return the ln of the posterior probability of being in a
        position. The posterior probability is just 1/error^2, where
        error is the difference between the y-value at this position
        and the minimum y-value."""
        if self.pos[0] > self.xmax or self.pos[0] < self.xmin:
            # We are outside the acceptable range, probability = 0
            return -np.inf
        res = float(self.exp.evalf(subs={Symbol('x'):float(pos[0])}))
        return np.log( 1/((res - self.ymin)**2) )


    def sample(self,nsamples,vardiv):
        """Generate a Markov chain of length `nsamples`, with the
        posterior probability related to the difference between
        the current position and the minimum position.

        vardim controls the variance of the proposal distribution, which
        will be equal to (domain width)/(vardiv). So making this big will
        cause small jumps and vice versa."""

        sampler = emcee.MHSampler([[var,var],[var,var]], #cov
                                  2, #dim
                                  self.lnprobfn)

        initval = float(np.random.uniform(self.xmin,self.xmax,1))
        res = sampler.run_mcmc([initval,initval],nsamples)

        self.chain = zip(*sampler.chain)[0]

    def toclient(self):
        """Return a dictionary of everything that needs to be passed
        to the client in order for plotting to take place."""
        return {"points" : self.points,
                "xmin" : self.xmin,
                "xmax" : self.xmax,
                "chain" : self.chain}
