export async function waitFor(timeInSeconds: number){
  return new Promise(resolve => {
    setTimeout(() => resolve(undefined), timeInSeconds * 1000)
  })
}