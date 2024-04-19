import * as tfnode from '@tensorflow/tfjs-node'
import { ObjectDetection, load } from '@tensorflow-models/coco-ssd'
import { readFile } from 'fs/promises'
import config from '../../../common/config'

let model: ObjectDetection | undefined = undefined

export const detectObjects = async (attachmentFileName: string) => {
  if (!model) {
    console.log('initialize coco')
    model = await load()
    console.log('model loaded')
  }

  const dirname = config.thumbnailDir + '/' + attachmentFileName.substring(0, 3)

  try {
    const fileData = await readFile(dirname + '/' + attachmentFileName + '.jpg')

    const image = tfnode.node.decodeImage(fileData)
    const result = await model.detect(image)

    process.stdout.write(dirname + '/' + attachmentFileName + '.jpg' + ' : ')

    if (result && result.length > 0) {
      result.forEach((res) => {
        process.stdout.write('[' + res.class + ':' + res.score + '] ')
      })
      process.stdout.write('\n-----\n')
    }

    tfnode.dispose(image)
    tfnode.disposeVariables()

    return result
  } catch (error) {
    return null
  }
}
