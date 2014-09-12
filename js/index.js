$(function() {
  var apiUrlBase;
  var catalog = {};

  function initApp(env) {
    var itemslist = $('#items ul');

    catalog = {};
    itemslist.empty();
    clearPurchases();

    fxpay.getProducts(function(error, products) {
      if (error) {
        console.error('Error getting products:', error);
        return showError(error);
      }
      products.forEach(function(productInfo) {
        console.info('Got product:', productInfo);
        catalog[productInfo.productId] = productInfo;
        addProduct(itemslist, productInfo.productId, productInfo);
      });
    });
  }

  function showError(msg) {
	    console.error(msg);
	    $('#error').text(msg);
	  }

  function showStatus(msg) {
	    console.log(msg);
	    $('#log').text(msg);
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
	    var prod = $(this).data('product');

	    showStatus('Purchasing', prod.name, prod.productId);

	    fxpay.purchase(prod.productId, function(err, info) {
	      if (err) {
	        console.error('Error purchasing product', info.productId,
	                      'message:', err);
	        return showError(err);
	      }
	      console.log('Item:', info.productId, info, 'purchased');
	      itemBought(info);
	    });
	  });

  function itemBought(productInfo) {
	   $('#bought ul li.placeholder').hide();
	   addProduct($('#bought ul'), productInfo, {showBuy: false});
	   showStatus('Item bought', productInfo);
	  }

  function clearPurchases() {
	    $('#bought ul li:not(.placeholder)').remove();
	    $('#bought ul li.placeholder').show();
	  }

  fxpay.configure({
	  apiUrlBase: [
	      'https://marketplace.allizom.org',
	    ]
	  });

  fxpay.configure({fakeProducts: false});

  fxpay.init({
    onerror: function(error) {
      console.error('Error during initialization:', error);
      return showError(error);
    },
    oninit: function(msg) {
      showStatus('fxPay initialized without errors', msg);
      initApp();
      showStatus(msg);
    },
    onrestore: function(error, info) {
      if (error) {
        console.error('error restoring product', info.productId,
                      'message:', error);
      }
    }
  });
});
