export class Helper {
  /**
   * Methode liefert eine Integerzahl, wenn eine Zahl oder Stringzahl vorliegt
   * Ansonsten wird die normale Variable ausgeliefert.
   */
  static parse (x) {
    return Number.isNaN(parseInt(x)) ? x : Number.parseInt(x)
  }

  static rangeIntersection (rangeA, rangeB) {
    // rangeA.start     rangeA.end
    // v                v
    // #----------------#
    //
    //         #----------------------#
    //         ^                      ^
    //         rangeB.start          rangeB.end
    //
    // or
    //
    //              rangeA.start        rangeA.end
    //                 v                v
    //                 #----------------#
    //
    //         #------------------#
    //         ^                  ^
    //       rangeB.start              rangeB.end
    return (rangeB.start >= rangeA.start && rangeB.start <= rangeA.end) || (rangeA.start >= rangeB.start && rangeA.start <= rangeB.end)
  }

  static removeAttributes (collection, blacklist) {
    let copy = Helper.deepClone(collection)
    Helper.removeProps(copy, blacklist)
    return copy
  }

  /**
   * Methode dient zum Rekursiven Durchsuchen von Objekten
   * @param {String} id ID des des Elements
   * @param {Object} scope Object das durchsucht werden soll
   * @param {String} childProp Attribut im scope, dass Kindelement beinhaltet
   */
  static getElement (id, scope, childProp) {
    if (scope.id === id) return scope

    let result

    for (let child of scope[childProp]) {
      result = child.id === id ? child : this.getElement(id, child, childProp)
      if (result) break // avoid further search
    }

    return result
  }

  /**
   * Methode dient zum Entfernen von Properties von einem Array
   * Objekte behalten den Type
   * Achtung: Circular Objects führen zu Infinite Loop!!
   * @param {Object} obj
   * @param {Array} blacklist
   */
  static removeProps (obj, blacklist) {
    for (let prop in obj) {
      if (blacklist.indexOf(prop) > -1) {
        delete obj[prop]
      } else if (typeof obj[prop] === 'object') {
        Helper.removeProps(obj[prop], blacklist)
      }
    }
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

    // console.log('addScopeProp - children: ' + childList.length)

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

  static shortName (text, isUpperCase, maxLength) {
    if (typeof text !== 'string') {
      console.log('Helper.shortName() - expected string')
      return text
    }

    maxLength = typeof maxLength === 'number' ? maxLength : text.length

    if (text.length <= maxLength) {
      return text.toUpperCase() // set uppercase
    }

    let length = text.length > maxLength ? maxLength : text.length
    let tmp = text.match(/\b\w/g) || [] // get initials
    tmp = tmp.slice(0, length) // cap to maxLength
    tmp = tmp.join().replace(/,/g, '') // create string
    if (isUpperCase) tmp = tmp.toUpperCase() // set uppercase

    return tmp
  }
}
