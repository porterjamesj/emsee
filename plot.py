"""Classes for generating plot data."""
from __future__ import division
import numpy as np
import sympy as sy
import emcee
from sympy.parsing.sympy_parser import parse_expr


class Plot:
    """Generic plot class."""
    def __init__(self, eq, nums):
        """Initialization requires a string the represents the equation for
        the plot, as well as the plot boudaries, which are xmin and xmax in
        one dimension and ymin and ymax in two dimensions. The boundaries
        are passed as a dictionary."""
        self.eq = eq
        for key in nums:
            setattr(self, key, nums[key])
        #try to parse the given equation
        try:
            self.exp = parse_expr(str(sy.sympify(self.eq)))
            # str b/c sympy does not like unicode
            #sympify so that ^ is an acceptable exponentiation operator
        except:
            raise RuntimeError("Equation parsing failed.")
        #validate ranges
        if self.xmin >= self.xmax:
            raise RuntimeError("Invalid range.")
        if hasattr(self, 'ymin'):
            if self.ymin >= self.ymax:
                raise RuntimeError("Invalid range.")


class OneDeePlot(Plot):
    """One dimensional plot class."""
    def evaluate(self, steps=1000):
        """Evaluate the given function at each of `step` points
        in the x domain."""
        stepsize = (self.xmax - self.xmin)/steps
        try:
            self.points = [(i, float(self.exp.evalf(subs={sy.Symbol('x'): i})))
                           for i in np.arange(self.xmin,
                                              self.xmax,
                                              stepsize)]
        except:
            raise RuntimeError("Evaluation failed.")
        self.ymin = min(zip(*self.points)[1])
        self.ymax = max(zip(*self.points)[1])

    def __lnprobfn(self, pos):
        """Return the ln of the posterior probability of being in a
        position. The posterior probability is just 1/error^2, where
        error is the difference between the y-value at this position
        and the minimum y-value."""
        if pos[0] > self.xmax or pos[0] < self.xmin:
            # We are outside the acceptable range, probability = 0
            return -np.inf
        res = float(self.exp.evalf(subs={sy.Symbol('x'): float(pos[0])}))
        return np.log(1/((res - self.ymin)**2))

    def sample(self, nsamples=1000, vardiv=10):
        """Generate a Markov chain of length `nsamples`

        vardim controls the variance of the proposal distribution, which
        will be equal to (domain width)/(vardiv). So making this big will
        cause small jumps and vice versa."""

        var = (self.xmax - self.xmin) / vardiv
        sampler = emcee.MHSampler([[var, var], [var, var]],  # cov
                                  2,  # dim
                                  self.__lnprobfn)

        initval = float(np.random.uniform(self.xmin, self.xmax, 1))
        sampler.run_mcmc([initval, initval], nsamples)

        self.chain = zip(*sampler.chain)[0]

    def toclient(self):
        """Return a dictionary of everything that needs to be passed
        to the client in order for plotting to take place."""
        return {"points": self.points,
                "xmin": self.xmin,
                "xmax": self.xmax,
                "chain": self.chain}


class TwoDeePlot(Plot):
    """Subclass for a two dimensional plot."""
    def evaluate(self, xsteps=100, ysteps=100):
        """Evaluate the plot's equation at a set of points determined
        by the number of x and y steps passed in."""

        stepsizex = (self.xmax - self.xmin)/xsteps
        stepsizey = (self.ymax - self.ymin)/ysteps

        # get list of x and y points to eval at
        self.xs = list(np.arange(self.xmin, self.xmax, stepsizex))
        self.ys = list(np.arange(self.ymin, self.ymax, stepsizey))

        self.zs = [[float(self.exp.evalf(subs={sy.Symbol('x'): i,
                                               sy.Symbol('y'): j}))
                    for j in self.ys]
                   for i in self.xs]

        # get min and max z value
        self.zmin = min([min(row) for row in self.zs])
        self.zmax = max([max(row) for row in self.zs])

    def __lnprobfn(self, pos):
        """Returns theln of the posterior probability of any point
        in the two dimensional space. This is just 1/error^2, where
        error is the difference between f(pos) and the minimum z value."""
        if (pos[0] > self.xmax or pos[0] < self.xmin or
                pos[1] > self.ymax or pos[1] < self.ymin):
            return -np.inf
        res = float(self.exp.evalf(subs={sy.Symbol('x'): float(pos[0]),
                                         sy.Symbol('y'): float(pos[1])}))
        return np.log(1/((res-self.zmin)**2))

    def sample(self, nsamples=1000, vardivx=10, vardivy=10):
        """Generate a Markov chain of length `nsamples`"""
        xvar = (self.xmax-self.xmin)/vardivx
        yvar = (self.ymax-self.ymin)/vardivy
        cov = np.array([[xvar, 0],
                        [0, yvar]])

        sampler = emcee.MHSampler(cov, 2, self.__lnprobfn)

        initstate = np.concatenate((
            np.random.uniform(self.xmin, self.xmax, 1),
            np.random.uniform(self.ymin, self.ymax, 1)
        ))

        sampler.run_mcmc(initstate, nsamples)

        self.chain = sampler.chain.tolist()

    def toclient(self):
        """Package up everything we need to send to the client in a dict."""
        return {"zs": self.zs,
                "xmin": self.xmin,
                "xmax": self.xmax,
                "ymin": self.ymin,
                "ymax": self.ymax,
                "zmin": self.zmin,
                "zmax": self.zmax,
                "chain": self.chain}
