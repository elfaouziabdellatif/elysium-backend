const fs = require("fs");
const path = require("path");

const folders = [
  "controllers",
  "models",
  "routes",
  "middlewares",
  "config",
  "utils",
];

const files = {
  ".": ["server.js", ".env", ".gitignore"],
  controllers: [
    "auth.controller.js",
    "user.controller.js",
    "seance.controller.js",
    "program.controller.js",
    "booking.controller.js",
    "membership.controller.js",
  ],
  models: [
    "user.model.js",
    "seance.model.js",
    "program.model.js",
    "exercise.model.js",
    "booking.model.js",
    "membership.model.js",
  ],
  routes: [
    "app.routes.js",
  ],
  middlewares: ["auth.middleware.js", "role.middleware.js"],
  config: ["db.js"],
  utils: ["generateToken.js"],
};

function createFolderStructure() {
  folders.forEach((folder) => {
    const dirPath = path.join(__dirname, folder);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
      console.log(`📁 Created folder: ${folder}`);
    }
  });

  Object.entries(files).forEach(([folder, fileList]) => {
    fileList.forEach((file) => {
      const filePath = path.join(__dirname, folder, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "");
        console.log(`📄 Created file: ${path.join(folder, file)}`);
      }
    });
  });

  console.log("\n✅ Project structure created successfully!");
}

createFolderStructure();
