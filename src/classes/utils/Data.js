import { Process } from '@/classes/Process'

export class Data {
  static getEmptyProcess () {
    return new Process('empty', 1, new Date(2017, 0, 6), new Date(2017, 0, 11))
  }

  static generateData () {
    let nodes = []

    nodes.push({ id: 1, p: new Process(1, 1, new Date(2017, 0, 1), null, true), position: { x: 0, y: 0 } })
    nodes.push({ id: 2, p: new Process(2, 1, new Date(2017, 0, 6), new Date(2017, 0, 11)), position: { x: 0, y: 0 } })
    nodes.push({ id: 3, p: new Process(3, 1, new Date(2017, 0, 11), new Date(2017, 0, 15)), position: { x: 0, y: 0 } })
    nodes.push({ id: 4, p: new Process(4, 2, new Date(2017, 0, 16), new Date(2017, 0, 24)), position: { x: 0, y: 0 } })
    nodes.push({ id: 5, p: new Process(5, 1, new Date(2017, 0, 21), new Date(2017, 0, 25)), position: { x: 0, y: 0 } })
    nodes.push({ id: 6, p: new Process(6, 2, new Date(2017, 0, 26), new Date(2017, 0, 30)), position: { x: 0, y: 0 } })
    nodes.push({ id: 7, p: new Process(7, 1, new Date(2017, 0, 31), new Date(2017, 0, 35)), position: { x: 0, y: 0 } })

    let edges = []

    edges.push({ id: 1, source: 1, target: 2, transform: '=' })
    edges.push({ id: 2, source: 2, target: 3, transform: '+' })
    edges.push({ id: 3, source: 3, target: 4, transform: '+' })
    edges.push({ id: 4, source: 3, target: 5, transform: '+' })
    edges.push({ id: 5, source: 5, target: 7, transform: '=' })
    edges.push({ id: 6, source: 4, target: 6, transform: '-' })
    edges.push({ id: 7, source: 6, target: 5, transform: '-' })

    let participants = []

    participants.push({ id: 1, name: 'A1' })
    participants.push({ id: 2, name: 'A2' })
    participants.push({ id: 3, name: 'A3' })

    return {
      nodes: nodes,
      edges: edges,
      participants: participants
    }
  }

  static printPath (collection) {
    let pathArray = collection.jsons()
    let ret = 'path: '

    pathArray.forEach(function (elem) {
      ret += elem.group === 'nodes' ? elem.data.id : ' > '
    })

    console.log(ret)
  }

  static generateRandomData (shapeCount, edgeCount) {
    console.log('addRandomData')

    function getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    for (let i = 0; i < shapeCount; i++) {
      this.shapes.push({ id: i, name: 'p' + i })
    }

    for (let i = 0; i < edgeCount; i++) {
      let rand1 = getRandomInt(0, shapeCount - 1)
      let rand2 = getRandomInt(0, shapeCount - 1)

      // avoid connection betwen the same element
      if (rand2 === rand1) {
        if (rand2 + 1 < shapeCount) rand2++
        else if (rand2 - 1 > 0) rand2--
      }

      this.addConnection(this.shapes[rand1].id, this.shapes[rand2].id)
    }
  }
}
