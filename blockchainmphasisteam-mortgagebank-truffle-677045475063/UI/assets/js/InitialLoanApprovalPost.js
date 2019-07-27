$('#button3').click(function () {
        

        var loanId = $("#loanId").val();
	var propertyDoc = $("#propertyDoc").val();
	var insId = $("#insId").val();
	var policyId = $("#policyId").val();
	var propertyType = $("#propertyType").val();
	var propertyAddress = $("#propertyAddress").val();
	var purchasePrice = $("#purchasePrice").val();
	var downPayment = $("#downPayment").val();
        


        $.ajax({

                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                url: "/insertCustomerPropertyForInsurance?insuranceAddress="+insId+"&loanId="+loanId+"&policyId="+policyId+"&propertyType="+propertyType+"&propertyAddress="+propertyAddress+"&purchasePrice="+purchasePrice+"&downPayment="+downPayment+"&taxReturnHash="+propertyDoc,
                type: "POST",
                global: false,
                async: false,
                success: function (result) {

			


			$.ajax({

					dataType: "json",
					contentType: 'application/json; charset=UTF-8',
					url: "/updatePolicyStatus?insuranceAddress="+insId+"&policyId="+policyId+"&status=property_details_uploaded",
					type: "POST",
					global: false,
					async: false,
					success: function (response) {

				        document.getElementById("txWaiting").style.display = "none";
				        document.getElementById("txIdData").innerHTML = response.txId;
				        document.getElementById("txMessageForm").style.display = "block";
				        setTimeout(function () {
				                window.location.href = "CustomerDashboard.html";
				        }, 2000);
			


					}
				});


                }
        });

});


