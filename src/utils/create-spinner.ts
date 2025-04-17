export async function createSpinner(enabled: boolean, message: string) {
  if (!enabled) {
    return {
      start: () => {},
      succeed: () => {},
      fail: () => {},
      stop: () => {}
    }
  }

  const ora = (await import('ora')).default
  return ora(message).start()
}
