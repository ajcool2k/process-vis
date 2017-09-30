import { Process } from '@/classes/model/Process'
import { Location } from '@/classes/model/Location'
import { Stakeholder } from '@/classes/model/Stakeholder'
import { Result } from '@/classes/model/Result'

export class Data2 {
  static generateData () {
    console.warn('generateData')

    // generate process
    let datamodel = new Process('process', 1, new Date(2017, 0, 1), null)

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
}
