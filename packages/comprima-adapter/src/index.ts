import app from './app';

const port = 4000

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
