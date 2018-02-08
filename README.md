# Beteiligungsprozess (Modellierung)

Diplomarbeit zum Thema: Technische Konzeption und Implementierung eines webbasierten Werkzeugs zur Modellierung von Stadtplanungs- und Stadtentwicklungsabläufen mit Bürgerbeteiligung im Rahmen des Projekts „Zukunftsstadt Dresden 2030“

## Branch

- [master] beinhaltet aktuellen Stand
- [stable] letzter Live-Branch für Demo
- [develop] beinhaltet aktuellen Entwicklungsstand (unstable)
- [feature-xxx] diverse Feature-Entwicklungen (unstable)

### Workflow

- create branch oder fork branch from [develop]
- push changes
- create pull request: branch into [develop]

## Technologie

- Projekt basierend auf Vue 2.0
- Entwicklung auf Basis von Webpack 2
- Einsatz eines [Vue Boilerplates](http://vuejs-templates.github.io/webpack/)


## Code style
- [StandardJS](https://standardjs.com/#standardjs--the-rules)
- use ESLint to comply the code style
- check .editorconfig.json and .eslint.json

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
## build for Linux systems
WEB_DIR=/my-app-path/ npm run build

## build for Windows systems
SET WEB_DIR=/my-app-path/
npm run build
```

## License

[MIT](http://opensource.org/licenses/MIT)