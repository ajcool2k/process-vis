export class Path {
  static validatePoints (points) {
    if (points instanceof Array === false) {
      console.warn('Path - expected Array of points')
      return false
    }

    return true
  }

  static createPolyline (points) {
    if (!Path.validatePoints) return ''

    // starting pos
    let path = 'M' + points[0].x + ',' + points[0].y

    // line to other points
    for (let i = 1; i < points.length; i++) {
      path += ' L' + points[i].x + ',' + points[i].y
    }

    return path
  }

  static createQuadratics (points) {
    if (!Path.validatePoints) return ''

    let path =
    'M' + points[0].x + ',' + points[0].y + ' ' + // starting pos
    'Q' + points[1].x + ',' + points[1].y + ' ' + // cp1
          points[2].x + ',' + points[2].y + ' ' + // cp2
    'T' + points[3].x + ',' + points[3].y // cp2 (target)

    return path
  }
}
