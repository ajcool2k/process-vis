import { Process } from '@/classes/model/Process'
import { Location } from '@/classes/model/Location'
import { Stakeholder } from '@/classes/model/Stakeholder'
import { Result } from '@/classes/model/Result'
import { Mathematic } from '@/classes/utils/Mathematic'

export class Data {
  static generateData () {
    console.warn('generateData')

    // stakeholder for the main-process
    let initiator = new Stakeholder('Main-Stakeholder', 'person')

    // generate process
    let datamodel = new Process('process', initiator.id, new Date(2017, 0, 1), null)
    datamodel.addStakeholder(initiator)

    // generate stakeholder
    let s1 = new Stakeholder('S1', 'group closed')
    let s2 = new Stakeholder('S2', 'group closed')
    let s3 = new Stakeholder('S3', 'group closed')

    datamodel.addStakeholder(s1)
    datamodel.addStakeholder(s2)
    datamodel.addStakeholder(s3)

    // generate child processes
    let child1 = new Process('child 1', s1.id, new Date(2017, 0, 1), null)
    child1.transformation.type = '='

    let location = new Location('Friedrich-List-Platz 1', '01069', 'Dresden', 'A117', { lat: '51.035467', lng: '13.736129' })
    child1.addLocation(location)

    let result = new Result('Result 1', 'Das Erste Ergebnis!!', '', 'AJ')
    child1.addResult(result)

    let stakeholder = new Stakeholder('Moon Inc.')
    datamodel.addStakeholder(stakeholder)

    let anotherStakeholder = new Stakeholder('Jupiter Inc.')
    let child11 = new Process('child 11', anotherStakeholder.id, new Date(2017, 0, 1))
    child1.addStakeholder(anotherStakeholder)

    child1.setChilds([child11])

    let child2 = new Process('child 2', s2.id, new Date(2017, 0, 6), new Date(2017, 0, 11))
    child2.transformation.type = '+'

    let child3 = new Process('child 3', s3.id, new Date(2017, 0, 6), new Date(2017, 0, 11))
    child3.transformation.type = '+'

    // setup connection between childs
    child1.addConnectionTo(child2)
    child1.addConnectionTo(child3)

    datamodel.setChilds([child1, child2, child3])

    return {
      datamodel: datamodel
    }
  }

  static generateRandomData () {
    console.log('addRandomData')

    // stakeholder for the main-process
    let initiator = new Stakeholder('Main-Stakeholder', 'person')

    // generate process
    let datamodel = new Process('generatedTest', initiator.id, new Date(2017, 0, 1), null)
    datamodel.addStakeholder(initiator)

    // generate stakeholder
    let countStakeholder = Mathematic.getRandomInt(1, 10)
    let stakeholder = []
    for (let i = 0; i < countStakeholder; i++) {
      let s = new Stakeholder('S' + i, 'group closed')
      datamodel.addStakeholder(s)
      stakeholder.push(s)
    }

    // generate child processes
    let countChilds = Mathematic.getRandomInt(1, 20)
    for (let i = 0; i < countChilds; i++) {
      let randomStakeholder = stakeholder[Mathematic.getRandomInt(0, stakeholder.length - 1)]
      let randomStartDate = new Date(2017, 0, Mathematic.getRandomInt(1, 28))
      let randomEndDay = null
      if (Mathematic.getRandomInt(0, 10) <= 2) {
        randomEndDay = new Date(randomStartDate.valueOf())
        randomEndDay.setDate(randomEndDay.getDate() + Mathematic.getRandomInt(0, 6))
      }

      let child = new Process('child ' + i, randomStakeholder.id, randomStartDate, randomEndDay)
      child.transformation.type = '='

      // generate childs for the child
      let x = Mathematic.getRandomInt(0, 100)
      if (x < 30) {
        let childStakeholder = new Stakeholder('Jupiter Inc.')
        let deepChild = new Process('child 11', childStakeholder.id, new Date(2017, 0, 1))
        child.addStakeholder(childStakeholder)
        child.setChilds([deepChild])
      }

      datamodel.addChild(child)
    }

    // setup connection between childs
    let childs = datamodel.childs

    childs.sort((a, b) => {
      return a.mEnd.valueOf() - b.mEnd.valueOf()
    })

    childs.forEach((child, index) => {
      let x = Mathematic.getRandomInt(0, 100)
      if (x < 100) {
        let otherChild = childs[Mathematic.getRandomInt(index, childs.length - 1)]
        if (otherChild !== child) child.addConnectionTo(otherChild)
      }
    })

    return {
      datamodel: datamodel
    }
  }
}
