// Must match reading-room-search/src/services/authenticationService/hash.ts,
// since the passwords in the users table are hashed that way.
import * as crypto from 'crypto'

const hashPassword = (password: string, salt: string): Promise<string> =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      Buffer.from(salt, 'base64'),
      1000,
      60,
      'sha1',
      (err, res) => {
        if (err) reject(err)
        else resolve(res.toString('base64'))
      }
    )
  })

export default { hashPassword }
