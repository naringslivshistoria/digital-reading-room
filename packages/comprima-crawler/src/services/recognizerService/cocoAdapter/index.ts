import * as tfnode from '@tensorflow/tfjs-node'
import { ObjectDetection, load } from '@tensorflow-models/coco-ssd'
import { readFile, readdir } from 'fs/promises'
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

    process.stdout.write(attachmentFileName + ': ')

    if (result && result.length > 0) {
      result.forEach((res) => {
        process.stdout.write('[' + res.class + ':' + res.score + '] ')
      })
    }
    process.stdout.write('\n-----\n')
    return result
  } catch (error) {
    return null
  }
}
