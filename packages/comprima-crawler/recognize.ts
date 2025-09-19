import { detectObjects } from './services/recognizerService/cocoAdapter'

const recognizeAttachment = async (filename: string) => {
  console.log('Detecting', filename)
  const results = await detectObjects(filename)

  console.log('results', results)
}

recognizeAttachment(process.argv[2])
