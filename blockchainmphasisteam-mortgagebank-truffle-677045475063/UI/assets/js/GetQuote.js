
$('#UploadIdentityDocuments').click(function(e){
	e.preventDefault();


	
	var quoteList = []
	

	var insAddress1 = $("#insAddress1").val();
	var insAddress2 = $("#insAddress2").val();
	var walletAddress = $("#walletAddress").val();
	var checkboxResult1 = $("#checkboxResult1").val();
	var checkboxResult2 = $("#checkboxResult2").val();

	var loanId = $("#loanId2").val();
	var bankAddress  = localStorage.getItem("getBankAddress");


	



	



	

	if (checkboxResult1 == "Yes" && checkboxResult2 == "Yes"){
		quoteList.push(insAddress1)
		
		quoteList.push(insAddress2)
		
	}
	else{
		
		if (checkboxResult1 == "Yes") {
			quoteList.push(insAddress1)
			}
		if (checkboxResult2 == "Yes") {
			quoteList.push(insAddress2)
		}
		
	
	}

	console.log(quoteList)


	dataObj = {
		"loanId": loanId,
			"insuranceAddresses":quoteList,
			"customerAddress":walletAddress
	}

	console.log(dataObj)


					        $("#waitingModal").modal();


	//        $("#waitingModal").modal();
	$.ajax({

		dataType: "json",
		contentType: 'application/json; charset=UTF-8',
		data:JSON.stringify(dataObj),
		processData: false,
		url: "/requestForQuote",
		type: "POST",
		global: false,
		async: false,
		success: function (result) {



						     document.getElementById("txId").innerHTML = result.tx_id;

					


	
				
			$.ajax({

					dataType: "json",
					contentType: 'application/json; charset=UTF-8',
					url: "/updatePortfolioStatus?sharedOwnerAddress="+bankAddress+"&loanId="+loanId+"&status=insurance_approval_pending&message=verify_ins_quote",
					type: "POST",
					global: false,
					async: false,
					success: function (result) {


					
                        $('#waitingModal').modal('hide');
                        $("#successModal").modal();
                       
				       // document.getElementById("txWaiting").style.display = "none";
				        //document.getElementById("txIdData").innerHTML = response.txId;
				        //document.getElementById("txMessageForm").style.display = "block";
				        setTimeout(function () {
				               window.location.href = "CustomerDashboard.html";
				        }, 2000);
			


					}
				});


                }
        });


});













				/*
		

			//alert(result);
			//  document.getElementById("txId").innerHTML = result.tx_id;
                       // $('#waitingModal').modal('hide');
                       // $("#successModal").modal();
                       
			setTimeout(function () {
				window.location.href = "CustomerDashboard.html";
			}, 2000);
			
		}
	});

});
*/


