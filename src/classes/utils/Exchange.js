import { Helper } from '@/classes/utils/Helper'
import { Storage } from '@/classes/utils/Storage'

export class Exchange {
  static cleanProcess (process) {
    let privates = Object.keys(process.mPrivates)
    return Helper.removeAttributes(process, privates)
  }

  static storeProcess (process) {
    console.warn('storeProcess')
    let fixedModel = Exchange.cleanProcess(process)
    Storage.save(fixedModel)
  }

  static openProcess (id) {
    console.warn('openProcess')
    return Storage.open(id)
  }

  static downloadProcess (process) {
    console.warn('downloadProcess')
    let fixedModel = Exchange.cleanProcess(process)
    const FileSaver = require('file-saver')
    const blob = new global.Blob([JSON.stringify(fixedModel, null, 2)], {type: 'text/plain;charset=utf-8'})
    let filename = 'datamodel_' + fixedModel.id + '.json'
    FileSaver.saveAs(blob, filename)
  }
}
