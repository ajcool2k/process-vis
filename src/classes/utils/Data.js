import { Process } from '@/classes/Process'

export class Data {
  static generateData () {
    let nodes = []
    let unsetPosition = { x: 0, y: 0 }

    nodes.push({ id: 'head', p: new Process('head', 1, new Date(2017, 0, 1), null, true), position: unsetPosition })
    nodes.push({ id: 'n0', p: new Process('n0', 1, new Date(2017, 0, 6), new Date(2017, 0, 11)), position: unsetPosition })
    nodes.push({ id: 'n1', p: new Process('n1', 1, new Date(2017, 0, 11), new Date(2017, 0, 15)), position: unsetPosition })
    nodes.push({ id: 'n2', p: new Process('n2', 2, new Date(2017, 0, 16), new Date(2017, 0, 24)), position: unsetPosition })
    nodes.push({ id: 'n3', p: new Process('n3', 1, new Date(2017, 0, 21), new Date(2017, 0, 25)), position: unsetPosition })
    nodes.push({ id: 'n4', p: new Process('n4', 2, new Date(2017, 0, 26), new Date(2017, 0, 30)), position: unsetPosition })
    nodes.push({ id: 'tail', p: new Process('tail', 1, new Date(2017, 0, 31), new Date(2017, 0, 35)), position: unsetPosition })

    let edges = []

    edges.push({ id: 1, source: 'head', target: 'n0', transform: '=' })
    edges.push({ id: 2, source: 'n0', target: 'n1', transform: '+' })
    edges.push({ id: 3, source: 'n1', target: 'n2', transform: '+' })
    edges.push({ id: 4, source: 'n1', target: 'n3', transform: '+' })
    edges.push({ id: 5, source: 'n3', target: 'tail', transform: '=' })
    edges.push({ id: 6, source: 'n2', target: 'n4', transform: '-' })
    edges.push({ id: 7, source: 'n4', target: 'n3', transform: '-' })

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
