export class Helper {
  /**
   * Methode liefert eine Integerzahl, wenn eine Zahl oder Stringzahl vorliegt
   * Ansonsten wird die normale Variable ausgeliefert.
   */
  static parse (x) {
    return Number.isNaN(parseInt(x)) ? x : Number.parseInt(x)
  }

  static deepClone (collection) {
    const clone = require('clone')
    return clone(collection)
  }

  /**
   * Methode liefert eine neue Id.
   * Es werden alle Objekte nach dem Attribute id durchsucht und die höchste Id um eins inkrementiert.
   */
  static nextId (x) {
    if (!x || typeof x !== 'object' || (x.length > 1 && !x[0].hasOwnProperty('id'))) {
      console.warn('Helper: expected Array of Objects with Attribute id')
      return
    }

    let idList = x.map(elem => elem.id)
    let highestId = Math.max(...idList) + 1 // Math.max.apply(null, idList) + 1
    return highestId
  }

  /**
   * Methode liefert den Vue-Scoped-Prop
   * @param {Node} elem Element das einen vue-Prop aufweist.
   * @returns String oder null
   */
  static getScopeProp (elem) {
    let propObj = elem.attributes

    let scopedData = Object.keys(propObj).map(key => {
      return propObj[key]
    }).filter(elem => {
      return elem.nodeName.startsWith('data-v-')
    })

    let scopedValue = scopedData.length > 0 ? scopedData[0].nodeName : null
    return scopedValue
  }

  static addScopeProp (elem, scopedProp) {
    var childList = elem.childNodes

    if (childList.length === 0) {
      // console.log(elem)
      if (elem.nodeType !== 3) elem.setAttribute(scopedProp, '')
      return
    }

    // console.log('addScopeProp - childs: ' + childList.length)

    childList.forEach(function (child) {
      Helper.addScopeProp(child, scopedProp)
      if (child.nodeType !== 3) child.setAttribute(scopedProp, '')
    }, this)
  }

  /**
   * Format {sourceId}->{tagetId}
   */
  static connectionParse (con) {
    if (typeof con !== 'string') {
      console.warn('connectionParse: expected string parameter')
      return con
    }

    let tmp = con.split('->')

    if (!tmp || tmp.length !== 2) {
      console.warn('connectionParse: could not find unique limiter')
      return con
    }

    return {
      source: tmp[0],
      target: tmp[1]
    }
  }
}
