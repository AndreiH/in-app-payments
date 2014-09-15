$(function() {
  var apiUrlBase;

  function initApp(env) {
    var itemslist = $('#items ul');

    itemslist.empty();


    fxpay.getProducts(function(error, products) {
      if (error) {
        console.error('Error getting products:', error);
        return showError(error);
      }
      products.forEach(function(productInfo) {
        console.info('Got product:', productInfo);
        addProduct(itemslist, productInfo);
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
  
  function addProduct(parent, prodData, i) {
	    i = i || {showBuy: true};
	    var li = $('<li></li>', {class: 'item'});

	    li.append($('<h4>' + prodData.name + '</h4>'));
	    parent.append(li);
	    li.append($('<img src=' + prodData.smallImageUrl + '/>'));
	    parent.append(li);

	    if (i.showBuy) {
	      li.append($('<button>Buy item!</button>').data({product: prodData}));
	    }
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

  fxpay.configure({fakeProducts: false,
	  apiUrlBase: 'https://marketplace.allizom.org',
	  receiptCheckSites: 'https://marketplace.allizom.org'});

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
