const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


// Validate body has respective values
function bodyHasName(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name) {
        return next();
    }
    next({ 
        status: 400, 
        message: `Dish must include a name.` 
    });
}

function bodyHasDesc(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description) {
        return next();
    }
    next({ 
        status: 400, 
        message: `Dish must include a description.` 
    });
}

function bodyHasPrice(req, res, next) {
    const { data: { price } = {} } = req.body;
    if (price) {
        return next();
    }
    next({ 
        status: 400, 
        message: `Dish must include a price.` 
    });
}

function priceIsValid(req, res, next) {
    const { data: { price } = {} } = req.body;
    // price cannot be missing and must be integer greater than 0
    if(price > 0 && typeof(price) === 'number') {
        return next();
    } 
    next({ 
        status: 400, 
        message: `Dish must have a price that is an integer greater than 0.` 
    });
}

function bodyHasImageUrl(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if (image_url) {
        return next();
    }
    next({ 
        status: 400, 
        message: `Dish must include a image_url.` 
    });
}

// Verify that the requested dish exists
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish)=> dish.id === dishId);

    if(foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`,
    });
}

function idMatches(req, res, next) {
    const { data: { id } = {} } = req.body;
    const { dishId } = req.params;
    if (id === dishId || id === '' || id === undefined || id === null) {
        return next();
    }
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Router : ${dishId}`,
    });
}

// Implement the /dishes handlers 
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;

    const newDish = {
      id: nextId(),
      name,
      description,
      price,
      image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}
  
function read(req, res, next) {
    res.json({ data: res.locals.dish });
}

function list(req, res) {   
    res.json({ data: dishes })
}

function update(req, res, next) {
    const { dish } = res.locals;

    const foundDish = dishes.find((orderedDish)=>orderedDish.id === dish.id);
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    
    if( foundDish.id) {
        dish.name = name;
        dish.description = description;
        dish.price = price;
        dish.image_url = image_url;
    }
    res.json({ data: dish });
  }
  
  module.exports = {
    create:[bodyHasName, bodyHasDesc, bodyHasPrice, priceIsValid, bodyHasImageUrl, create],
    list,
    read: [dishExists, read],
    update: [dishExists, idMatches, bodyHasName, bodyHasDesc, bodyHasPrice, priceIsValid, bodyHasImageUrl,  update],
  }