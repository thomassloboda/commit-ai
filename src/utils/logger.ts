export const getLogger = (quiet = false) => {
  return quiet ? undefined : console;
}
