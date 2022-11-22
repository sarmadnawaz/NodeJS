const fs = require("fs");
const express = require("express");
const app = express();

// middleware
app.use(express.json());

// Reading and Parsing Tours data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/assests/tours.json`));

// route handler to handle getTours request
function getTours(req, res) {
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
}

// route handler to handle getTour request
function getTour(req, res) {
  const { id } = req.params;
  const tour = tours.find((tour) => tour.id === +id);
  if (!tour) {
    res.status(404).json({
      status: "success",
      message: "Tour not found with this id",
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
}

// route handler to handle postTour request
function createTour(req, res) {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(`${__dirname}/data/tours.json`, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: "success",
      tour: newTour,
    });
  });
}

// route handler to handle updateTour request
function updateTour(req, res) {
  const { id } = req.params;
  console.log(id)
  if (+id > tours.length) return;
  const newTours = tours.map((tour) => {
    if (tour.id === +id) {
      return { ...tour, ...req.body };
    } else {
      return tour;
    }
  });
  fs.writeFile(
    `${__dirname}/assests/tours.json`,
    JSON.stringify(newTours),
    (err) => {
      res.status(200).json({
        status: "success",
        message: "Tour Updated",
      });
    }
  );
}

function deleteTour(req, res) {
    const { id } = req.params;
    if(+id > tours.length){
        res.status(404)
        return
    }
    const newTour = tours.filter(tour => tour.id !== +id)
    fs.writeFile(
        `${__dirname}/assests/tours.json`,
        JSON.stringify(newTour),
        (err) => {
          res.status(200).json({
            status: "success",
            message: "Tour has been deleted",
          });
        }
      );
}

// route to handle getTours request
app.get("/api/v1/tours", getTours);

// route to handle getTour request
app.get("/api/v1/tours/:id", getTour);

// route to handle postTours request
app.post("/api/v1/tours", createTour);

// route to handle patchTour request
app.patch("/api/v1/tours/:id", updateTour);

// route to handle deleteTour request
app.delete("/api/v1/tours/:id", deleteTour);


const port = 3000;
app.listen(port, () => {
  console.log("app is running on port: " + port);
});
