const express = require('express');

const router = express.Router();

const {
    getCustomerOrder,
    createCustomerOrder,
    updateCustomerOrder,
    deleteCustomerOrder,
    getAllOrders,
    getOrdersByEmail,
    updateOrderStatus
  } = require('../controllers/customer_orders');

  router.route('/')
  .get(getAllOrders)
  .post(createCustomerOrder);

  // Must be registered before '/:id' so the path "user/:email" is not captured as an order id
  router.get('/user/:email', getOrdersByEmail);

  // Lightweight admin status update (only changes the status field)
  router.patch('/:id/status', updateOrderStatus);

  router.route('/:id')
  .get(getCustomerOrder)
  .put(updateCustomerOrder) 
  .delete(deleteCustomerOrder); 


  module.exports = router;