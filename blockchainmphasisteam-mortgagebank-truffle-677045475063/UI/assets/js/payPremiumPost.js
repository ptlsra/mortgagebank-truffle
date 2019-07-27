


$('#button7').click(function () {

            
	var loanId = $("#loanIds").val();
	var insuranceAddress = $("#insAdd").val();  
	var customerAddress = $("#customerAddress").val();
	


var premiumAmountPaid = $("#premiumAmountPaid").val();
	premiumAmountPaid = premiumAmountPaid.split('$').join('');

	//premiumAmountPaid = premiumAmountPaid.replace(/$/g, "");

	
	var userName = localStorage.getItem("userName");
        $("#waitingModal").modal();

	$.ajax({

		dataType: "json",
		contentType: 'application/json; charset=UTF-8',
		url: "/payPremium?loanId="+loanId+"&premiumAmount="+premiumAmountPaid+"&insuranceAddress="+insuranceAddress+"&customerAddress="+customerAddress+"&userName="+userName,
		type: "POST",
		global: false,
		async: false,
		success: function (result) {

			 document.getElementById("txId").innerHTML = result.message;
                        $('#waitingModal').modal('hide');
                        $("#successModal").modal();
			setTimeout(function () {
				window.location.href = "CustomerDashboard.html";
			}, 2000);
			// ViewTokenForBaggage.html?baggageId=5615192
		}
	});

});
