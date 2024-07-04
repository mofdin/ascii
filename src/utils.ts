import readline from 'node:readline'

export const input = (question: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (response) => {
      rl.close()
      resolve(response)
    })
  })
}

export const print = (message: string): void => {
  console.log(message)
}

export const quit = (): void => {
  process.exit(0)
}

export const drawLine = (): void => {
  print('Xx-------------------------------------------xX')
}

export const random = (min: number, max: number): number => {
  min = Math.ceil(min)
  max = Math.floor(max)

  // Not inclusive of the max value
  // const number = Math.floor(Math.random() * (max - min)) + min
  // Inclusive of the max value
  const number = Math.floor(Math.random() * (max - min + 1)) + min

  return number
}
