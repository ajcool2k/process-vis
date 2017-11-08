import { Version } from '@/classes/model/Version'

export class Patch {
  static updateModel (model) {
    if (typeof model !== 'object') {
      console.warn('Patch.updateModel() - expected Process')
      return
    }

    if (typeof model.dmv !== 'string') {
      console.warn('Patch.updateModel() - expected version as string')
      return
    }

    if (model.dmv === Version.actualVersion) {
      return
    }

    if (Version.isSupported(model.dmv) === false) {
      console.warn('Patch.updateModel() - your Version ' + model.dmv + ' is not supported yet')
      return
    }

    console.log('Version is supported')

    if (model.dmv === 'unknown') Patch.vUnknownv10(model)
    if (model.dmv === '1.0') Patch.v100v101(model)
  }

  static vUnknownv10 (model) {
    model.dmv = '1.0'
  }

  static v100v101 (model) {
    if (model.hasOwnProperty('childs')) {
      model.children = model.childs
      model.childs = undefined
    }

    model.dmv = '1.0.1'
  }
}
