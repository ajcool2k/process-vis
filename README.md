# Process Modeler

Diplomarbeit zum Thema Modellierung von Prozessabläufen.

## Technologie

- Projekt basierend auf Vue 2.0
- Entwicklung auf Basis von Webpack 2
- Einsatz eines [Vue Boilerplates](http://vuejs-templates.github.io/webpack/)

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production against a public web path
WEB_DIR=/process-vis/ npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test

# debug project setup
npm run dump

# update project to latest compatible versions
npm update

```

## Troubleshooting

``` bash
# phantomjs prebuild installer crashes -> skip installer
npm install phantomjs-prebuilt@2.1.14 --ignore-scripts

# node-sass not available for your architecture -> compile against own system
npm rebuild node-sass

# web-links are broken -> build against a public web dir: server/appRoute/
WEB_DIR=/my-app-path/ npm run build

```