const fs = require("fs");

// Reading File Synchronously
const textIn = fs.readFileSync("./assests/input.txt", "utf-8");
// console.log(textIn)

// Writing File Synchronously
const textOut = "This is Output : " + textIn;
fs.writeFileSync("./assests/output.txt", textOut);

// Reading File Asynchronously
fs.readFile("./assests/input.txt", "utf-8", (err, text) => {
  console.log(text);
});

// Reading File Asynchronously
fs.writeFile(
  "./assests/outputAsync.txt",
  "File is written Asynchronously " + textIn,
  "utf-8",
  (err) => {}
);
