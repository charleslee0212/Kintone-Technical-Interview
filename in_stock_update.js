//does not allow users to change quantity when inventory is updated

(function() {
  'use strict';

  var events = [
    'app.record.create.show',
    'app.record.edit.show'
  ];

  kintone.events.on(events, function(event){
    
    var record = event.record;
    var orderStatus = record.order_status.value;
    var orderType = record.order_type.value;
    
    //disables quantity so users. cannot change it after inventory update
    if(orderType === 'Sale' && orderStatus !== 'Processing' || (orderType === 'Purchase' && orderStatus === 'Delivered')){
      record.quantity.disabled = true;
    }
    
    return event;
  });
})();