const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const fs = require("fs");
const { log } = require("console");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  fs.readdir("./files", (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading files");
    } else {
      res.render("index", { files: files.map(file => file.replace('.txt', '')) }); // remove .txt extension
    }
  });
});

app.get('/file/:filename', (req, res) => {
  fs.readFile(`./files/${req.params.filename}.txt`, "utf-8", (err, filedata) => {
    if (err) {
      console.error(err);
      res.status(404).send("File not found");
    } else {
      console.log(`Rendering show.ejs with filename: ${req.params.filename} and filedata: ${filedata}`);
      res.render('show', { filename: req.params.filename, filedata });
    }
  });
});

app.get('/edit/:filename', (req, res) => {
  fs.readFile(`./files/${req.params.filename}.txt`, "utf-8", (err, filedata) => {
    if (err) {
      console.error(err);
      res.status(404).send("File not found");
    } else {
      res.render('edit', { filename: req.params.filename, filedata });
    }
  });
});
app.post('/edit', (req, res) => {
  const oldName = req.body.previous;
  const newName = req.body.newname;
  const filePath = `./files/${oldName}.txt`;

  fs.readFile(filePath, 'utf-8', (err, filedata) => {
    const updatedData = filedata.replace(oldName, newName);
    fs.rename(filePath, `./files/${newName}.txt`, () => {
      fs.writeFile(`./files/${newName}.txt`, updatedData, () => {
        res.redirect('/');
      });
    });
  });
});

app.post('/create', (req, res) => {
  fs.writeFile(`./files/${req.body.title.replace(/\s+/g, '')}.txt`, req.body.details, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error creating file");
    } else {
      res.redirect('/');
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});