import app from './app';
import { readdir, unlink } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const port = 4000

// Best-effort sweep of transcode temp files orphaned by a previous crash.
readdir(tmpdir(), (err, files) => {
  if (err) return
  files
    .filter((f) => f.startsWith('comprima-mp4-'))
    .forEach((f) =>
      unlink(join(tmpdir(), f), () => {
        /* best-effort */
      })
    )
})

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
