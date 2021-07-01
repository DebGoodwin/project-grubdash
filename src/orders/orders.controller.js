const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");


// Validation handlers
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order)=> order.id === orderId);
    
    if(foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`,
    });
}

function idMatches(req, res, next) {
    const { data: { id } = {} } = req.body;
    const { orderId } = req.params;
    if (id === orderId || !id ) {
        return next();
    }
    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
}

function bodyHasDeliverTo(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo) {
        res.locals.deliverTo = deliverTo;
        return next();
    }
    next({ 
        status: 400, 
        message: `Order must include a deliverTo.` 
    });
}

function bodyHasMobile(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber) {
        res.locals.mobileNumber = mobileNumber;
        return next();
    }
    next({ 
        status: 400, 
        message: `Order must include a mobileNumber.` 
    });
}

function bodyHasDish(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if (dishes && Array.isArray(dishes) && dishes.length > 0){
        res.locals.dishes = dishes;
        return next();
    }
    next({ 
        status: 400, 
        message: `Order must include a dish.` 
    });
}

function quantityIsValid(req, res, next) {
    const dishes = res.locals.dishes;

    for(let i = 0; i < dishes.length; i++) {
        if(!dishes[i].quantity || !Number.isInteger(dishes[i].quantity) > 0 ) { 
            return next({ 
                status: 400, 
                message: `Dish ${i} must have a quantity that is an integer greater than 0` 
            });
        }
    }
    next();
}

function bodyHasStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
    const validStatus = ['pending','preparing','out-for-delivery'];
    if (validStatus.includes(status)) {
        res.locals.status = status;
        return next();
    }
    next({ 
        status: 400, 
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered.` 
    });
}

  
// Orders handlers 
function create(req, res) {
    const { deliverTo, mobileNumber, status, dishes } = res.locals;
    const newOrder = {
      id: nextId(),
      deliverTo,
      mobileNumber,
      status,
      dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function list(req, res) { 
    res.json({ data: orders })
} 

function read(req, res, next) {
    res.json({ data: res.locals.order });
}

function update(req, res, next) {
    const { order } = res.locals;
    const foundOrder = orders.find((ordered)=>ordered.id === order.id);
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    
    if(foundOrder){
        order.deliverTo = deliverTo;
        order.mobileNumber = mobileNumber;
        order.status = status;
        order.dishes = dishes;
    }
    res.json({ data: order });
}

function destroy(req, res, next) {
    const { orderId } = req.params;
    const order = res.locals.order;
    const index = orders.findIndex((order) => order.id === Number(orderId));
    if(order.status !== 'pending') {
        return next({
            status: 400,
            message: 'An order cannot be deleted unless it is pending.',
        });
    }
    orders.splice(index, 1);
    res.sendStatus(204);
}
    

module.exports = {
    create:[
        bodyHasDeliverTo, 
        bodyHasMobile, 
        bodyHasDish, 
        quantityIsValid, 
        create
    ],
    list,
    read: [
        orderExists, 
        read
    ],
    update: [
        orderExists, 
        idMatches, 
        bodyHasDeliverTo, 
        bodyHasStatus,
        bodyHasMobile, 
        bodyHasDish, 
        quantityIsValid, 
        update
    ],
    delete: [
        orderExists, 
        destroy
    ],
} 