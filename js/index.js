$(function() {
  var apiUrlBase;
  var catalog = {};

  function initApp(env) {
    var itemslist = $('#items ul');

    catalog = {};
    itemslist.empty();

    fxpay.getProducts(function(error, products) {
      if (error) {
        console.error('Error getting products:', error);
      }
      products.forEach(function(productInfo) {
        console.info('Got product:', productInfo);
        catalog[productInfo.productId] = productInfo;
        addProduct(itemslist, productInfo.productId, productInfo);
      });
    });
  }

  function addProduct(parent, prodID, prodData, i) {
    i = i || {showBuy: true};
    var li = $('<li></li>', {class: 'item'});

    if (i.showBuy) {
      li.append($('<button>Buy item!</button>').data({productId: prodID,
                                                product: prodData}));
    }
    li.append($('<h4>' + prodData.name + '</h4>'));
    parent.append(li);
  }

  $('ul').on('click', '.item button', function() {
    var id = $(this).data('productId');
    var prod = $(this).data('product');
    fxpay.purchase(id, function(error, info) {
      if (error) {
        console.error('error purchasing product', info.productId,
                      'message:', error);
      }
    });
  });

  fxpay.configure({fakeProducts: true});

  fxpay.init({
    onerror: function(error) {
      console.error('error during initialization:', error);
    },
    oninit: function() {
      console.log('fxPay initialized without errors');
      initApp();
    },
    onrestore: function(error, info) {
      if (error) {
        console.error('error restoring product', info.productId,
                      'message:', error);
      }
    }
  });
});
