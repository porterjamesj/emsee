import numpy as np
import sympy as sym


def rescale(arr,m):
    '''Rescale a numpy array so that it runs from 0 to m.'''
    slid = arr-arr.min()
    return slid/slid.max() * m


class Plot:
    '''Class to represent an svg plot object.'''
    def __init__(self, func, limits, psize, offset):
        '''
        func:
            The function of x that this plot will display. Should be a sympy object
            evaluable by func.evalf(subs).

        limits:
            A tuple containing the min and max x value the function
            should be evaluated for.

        psize:
            A tuple containing the x and y dimensions (in pixels) of the plot

        offset:
            The amount of extra space you want between the edges of
            the plot and the edges of the svg.
        '''

        x = sym.Symbol('x') # this is needed to evaluate the function of x
        
        self.func = func
        self.xmin = float(limits[0])
        self.xmax = float(limits[1])
        self.pwidth = float(psize[0])
        self.pheight = float(psize[1])
        self.offset = float(offset)

        self.stepsize = (self.xmax-self.xmin) / ((self.xmax-self.xmin)*100)

        # Now evaluate the function
        self.evals = [(i,self.func.evalf(subs={x:i}))
                      for i in np.arange(self.xmin,
                                            self.xmax,
                                            self.stepsize)]

        # get out the x and y values for convenience later
        self.evalxs = np.array(zip(*self.evals)[0])
        self.evalys = np.array(zip(*self.evals)[1])

        # figure out y min and max
        self.ymin = min(self.evalys)
        self.ymax = max(self.evalys)
        
        #rescale the results to the size of the plot
        self.scaledxs = rescale(self.evalxs,self.pwidth)
        self.scaledys = rescale(self.evalys,self.pheight)
        self.scaledevals = zip(self.scaledxs, self.scaledys)
        
    def __repr__(self):
        return str((self.func,(self.pwidth,self.pheight)))

    def svgout(self):
        '''
        Return a dictionary of stuff suitable to be used in drawing the svg.

        x:
            array of x function values
        y:
            array of y function values
        xaxis:
            the endpoints of the xaxis
        yaxis:
            the endpoints of the yaxis
        xlims:
            the limits of the x axis in the function space, for labeling
        ylims:
            like x lims, but for y
        svgsize:
            the size of the svg
        '''

        svg = {}

        svg['x'] = self.scaledxs + self.offset
        svg['y'] = self.scaledys + self.offset

        xaxispos = float((max(0,-self.ymin)/(self.ymax-self.ymin))*self.pheight)
        yaxispos = float((max(0,-self.xmin)/(self.xmax-self.xmin))*self.pwidth)

        print self.ymin,self.ymax,self.pheight,xaxispos
        
        svg['xaxis'] = ((self.offset,self.offset+xaxispos),
                        (self.offset+self.pwidth,self.offset+xaxispos))
        svg['yaxis'] = ((self.offset+yaxispos,self.offset),
                        (self.offset+yaxispos,self.offset+self.pheight))
        svg['xlims'] = (self.xmin,self.xmax)
        svg['ylims'] = (self.ymin,self.ymax)

        # i need to come up with a good method for positioning the axis end labels
        
        svg['svgsize'] = (self.pwidth+2*self.offset,
                          self.pheight+2*self.offset)

        svg['datastring'] =  " ".join(["{0},{1}".format(x,y)
                              for (x,y) in zip(svg['x'],svg['y'])])
        
        return svg
