//Inventory automation
//allows users to automate inventory when order is placed
//handles error when the order type is sale and the order quantity is greater than stock

(function() {
  'use strict';
  var handler = async (event) => {
    //access to field
    var record = event.record;
    
    var orderType = record.order_type.value;
    var orderStatus = record.order_status.value;
    var orderAmount = Number(record.quantity.value);
    var productID = record.product_ID.value;
    var recordID = record.record_ID.value;
    
    //place holder variable for api request to finish
    var inStock;
    
    //ID for api request
    var PRODUCT_DB_ID = 9;
    
    //a holder variable for the new amount to update the inventory
    var newAmount;
    
    try {

      //async/await for api call 'GET' data from item master: in_stock
      var resp = await kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
        'app': 9,
        'id': recordID
      });

      inStock = Number(resp.record.in_stock.value);

    } catch (e) {
      event.error = ("API REQUEST TO record_name: " + recordID + " COULD NOT BE COMPLETED\nPLEASE TRY AGAIN");
      console.log(e);
    }
    
    //check to see if it is a sale(subtract to the stock) or purchase(add to the stock) 
    if (orderType === 'Sale') {
      //Restrict if the order amount is greater than in stock
      if (inStock < orderAmount) {
        record.quantity.error = 'Not Enough Stock! \nCurrently have ' + inStock + ' unit(s)';
      } else {
        newAmount = inStock - orderAmount;
      }
    } else {
      newAmount = inStock + orderAmount;
    }
    
    //only allow inventory update if the order is shipped or delivered
    if ((orderType === 'Sale' && orderStatus === 'Shipped') || (orderType === 'Purchase' && orderStatus === 'Delivered')) {
      
      //api call
      kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', {
        app: PRODUCT_DB_ID,
        updateKey: {
          field: 'product_ID',
          value: productID
        },
        record: {
          in_stock: {
            value: newAmount
          }
        }
      }).then(function(resp) {
        alert("Inventory has been updated!");
        console.log(resp);
      }).catch(function(error) {
        console.log(error);
      });

    }

    return event;
  }

  kintone.events.on([
    'app.record.index.edit.submit',
    'app.record.create.submit',
    'app.record.edit.submit'
  ], handler);
})();