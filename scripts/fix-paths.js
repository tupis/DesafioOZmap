const fs = require("fs");
const path = require("path");

function replaceTsWithJs(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceTsWithJs(fullPath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(fullPath, "utf8");
      content = content.replace(/\.ts/g, ".js"); // Substitui todas as referências a .ts
      fs.writeFileSync(fullPath, content, "utf8");
    }
  });
}

const distPath = path.resolve(__dirname, "../dist"); // Garante que está apontando para a pasta de saída do TypeScript
replaceTsWithJs(distPath);

console.log("✅ Todas as referências .ts foram substituídas por .js.");
