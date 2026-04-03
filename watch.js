const chokidar = require("chokidar");
const { exec } = require("child_process");

// Sledujeme aktuální složku (kde je script puštěn)
const path = "./";

let timeout = null;

console.log(`[Watcher] Spuštěno sledování složky: ${require('path').resolve(path)}`);
console.log(`[Watcher] Jakákoliv nová změna spustí automatický push na GitHub po 2 vteřinách. Očekávám úpravy...`);

chokidar.watch(path, { 
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../, // ignorovat skryté soubory jako .git, .env atd.
}).on("all", (event, filePath) => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    console.log(`[Watcher] Změna detekována (${event}: ${filePath}) → pushuju na GitHub...`);

    // Provede přidání, commit s timestampem a push
    const time = new Date().toLocaleTimeString();
    exec(`git add . && git commit -m "Auto update: ${time}" && git push`, { cwd: path }, (err, stdout, stderr) => {
      if (err) {
        // Ignorujeme varování o tom, že "nic k commitnutí" neexistuje atp.
        if (!stdout.includes("nothing to commit")) {
            console.error("[Watcher] Chyba při gitu:", err.message);
        } else {
            console.log("[Watcher] Git: Není co pushovat.");
        }
        return;
      }
      console.log(`[Watcher] ✅ Úspěšně nahráno:`);
      console.log(stdout.trim());
    });

  }, 2000); 
});
