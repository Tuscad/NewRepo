import { listen } from './src/app'; // ← teraz ścieżka się zgadza!
const PORT = process.env.PORT || 3000;

listen(PORT, () => {
    console.log(`SFGame Bot backend running on http://localhost:${PORT}`);
});
