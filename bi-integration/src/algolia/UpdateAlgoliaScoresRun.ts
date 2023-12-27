import { handler } from './UpdateAlgoliaScores';

(async () => {
    await handler();
})().then(() => console.log('Handler finished!'));