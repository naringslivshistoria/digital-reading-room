import { indexSearch } from './services/indexSearch';
import { from, map, mergeMap, retryWhen, tap } from 'rxjs';
import { delay } from 'rxjs/operators';

console.log('Comprima Crawler');

const levels: number[] = [];
for (let i = 41080; i > 41000; i--) {
  levels.push(i);
  //const response = indexSearch(i.toString(), ['41000']).then(meow => console.log('Meow', meow));
}

console.log(levels)

const purr = from(levels).pipe(
  // tap(level => console.log('Level', level)),
  mergeMap(level => indexSearch(level.toString()).then(meow => {
    console.log('Meow', meow)
    return meow
  }).catch(error => {
    console.error(error)
    return error
  }), 2),
  retryWhen((errors) =>
      errors.pipe(
        tap((err) => console.error('Zip streams error, retrying in 1s...', err)),
        delay(1000)
      )
    ),
  tap(meow => console.log('Meow', meow))
)

purr.subscribe()

