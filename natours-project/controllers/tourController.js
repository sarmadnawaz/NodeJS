const fs = require('fs');

// Reading and Parsing Tours data
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

const checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid Id',
    });
  }
  next();
};

// route handler to handle getTours request
function getTours(req, res) {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
}

// route handler to handle getTour request
function getTour(req, res) {
  const { id } = req.params;
  const tour = tours.find((el) => el.id === +id);
  if (!tour) {
    res.status(404).json({
      status: 'success',
      message: 'Tour not found with this id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
}

// route handler to handle postTour request
function createTour(req, res) {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { ...req.body, id: newId };
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        tour: newTour,
      });
    }
  );
}

// route handler to handle updateTour request
function updateTour(req, res) {
  const { id } = req.params;
  const newTours = tours.map((tour) => {
    if (tour.id === +id) {
      return { ...tour, ...req.body };
    } else {
      return tour;
    }
  });
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(newTours),
    (err) => {
      res.status(200).json({
        status: 'success',
        message: 'Tour Updated',
      });
    }
  );
}

function deleteTour(req, res) {
  const { id } = req.params;
  const newTour = tours.filter((tour) => tour.id !== +id);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(newTour),
    (err) => {
      res.status(200).json({
        status: 'success',
        message: 'Tour has been deleted',
      });
    }
  );
}

module.exports = {
  checkID,
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
};
