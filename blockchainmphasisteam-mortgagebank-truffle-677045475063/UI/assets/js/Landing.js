	$.get("/getCoinBase", function(data, status){
	bankAddress = data.coinBase
	//alert (bankAddress)
	  localStorage.setItem("getBankAddress",bankAddress)
    });




// Set Insurance address here
//localStorage.setItem("insAdd", "0x3819f4379766403a19ec74bfae9a8523d278e4ae");

