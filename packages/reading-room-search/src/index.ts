import app from './app';

const port = 4001

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
