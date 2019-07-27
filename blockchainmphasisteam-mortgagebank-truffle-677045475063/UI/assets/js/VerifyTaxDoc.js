$('#button3').click(function () {
	//alert('clicked');
            
	var loanId = $("#loanData").val();
	var bankAddress  = localStorage.getItem("getBankAddress");


	$("#waitingModal").modal();


	$.ajax({

		dataType: "json",
		contentType: 'application/json; charset=UTF-8',
		url: "/updatePortfolioStatus?sharedOwnerAddress="+bankAddress+"&loanId="+loanId+"&status=insurance_pending&message=apply_for_insurance",
		type: "POST",
		global: false,
		async: false,
		success: function (result) {
			//alert(result);
			
                        
                        document.getElementById("txId").innerHTML = result.message;
                        $('#waitingModal').modal('hide');
                        $("#successModal").modal();


			setTimeout(function () {
				window.location.href = "PortfolioForBank.html";
			}, 2000);
			
		}
	});

});
