import util from 'util'

const exec = util.promisify(require('child_process').exec)

export default async function asyncExec(command) {
  try {
    const { stdout, stderr } = await exec(command)
    if (stderr) throw new Error(stderr)
    return stdout.trim()
  } catch (e) {
    return e
  }
}
