import { Helper } from '@/classes/utils/Helper'
import { Storage } from '@/classes/utils/Storage'

export class Exchange {
  static cleanProcess (process) {
    let privates = Object.keys(process.mPrivates)
    return Helper.removeAttributes(process, privates)
  }

  static storeProcess (processWrapper, modifiedDate) {
    console.warn('storeProcess')
    process.modified = new Date()
    let fixedModel = Exchange.cleanProcess(processWrapper.model)
    processWrapper.model = fixedModel
    Storage.save(processWrapper, modifiedDate)
  }

  static removeProcess (id) {
    console.warn('removeProcess')
    return Storage.remove(id)
  }

  static openProcess (id) {
    console.warn('openProcess')
    return Storage.open(id)
  }

  static downloadProcess (process, metadata) {
    console.warn('downloadProcess')

    let fixedModel = Exchange.cleanProcess(process)
    let processWrapper = Exchange.wrapProcess(fixedModel, metadata)

    const FileSaver = require('file-saver')
    const blob = new global.Blob([JSON.stringify(processWrapper, null, 2)], {type: 'application/json; charset=utf-8'})
    let filename = 'datamodel_' + processWrapper.id + '.json'
    FileSaver.saveAs(blob, filename)
  }

  static wrapProcess (process, metadata) {
    return {
      id: process.id,
      metadata: metadata,
      model: process
    }
  }
}
