$('#login').click(function () {
	
            
	var walletAddress =  localStorage.getItem("walletAddress");
        var userName = localStorage.getItem("userName");
        var password = $("#password").val();

	$.ajax({

		dataType: "json",
		contentType: 'application/json; charset=UTF-8',
		url: "/authenticate?walletAddress="+walletAddress+"&userName="+userName+"&password="+password,
		type: "POST",
		global: false,
		async: false,
		success: function (result) {
			//alert(result);
			document.getElementById("txWaiting").style.display = "none";
			document.getElementById("txIdData").innerHTML = result.txId;
			document.getElementById("txMessageForm").style.display = "block";
			setTimeout(function () {
				window.location.href = "CustomerDashboard.html";
			}, 2000);
			// ViewTokenForBaggage.html?baggageId=5615192
		}
	});

});
