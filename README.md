# See process.md under docs for current status. Below is reference only, not being used at this time

# CERR_Application

Geo-Processing Pipeline for CERR.  Geocode Addresses and Place Look-up via [Point2Place API](https://github.com/ColoradoDemography/Point2PlaceAPI).  Compiling Stats.

This is a [webpack](https://webpack.github.io/) project.  It is written in ES6 Javascript that is compiled to ES5 for compatibility (through [Babel](https://babeljs.io/)).  [Flow Type](https://flowtype.org/) checking is enabled.  [ESLint](http://eslint.org/) is enabled.  Formatted comments provide for automated documentation through [DocumentationJS](http://documentation.js.org/). 


To continue development:  

```
git clone https://github.com/ColoradoDemography/CERR_Application.git
```

Then install dependencies with one command:

```
npm install
```

Then fire up the development server:

```
npm run websrv
```

By default, your development app will be at http://0.0.0.0:8080/webpack-dev-server/

You may prefer to adjust these to your particular environment.  See the package.json 'scripts' entry to make any necessary adjustments.

To build a production version:

```
npm run build
```

