


$("form#uploadForm").submit(function(e) {
	
    e.preventDefault();    
	
	var bankAddress  = localStorage.getItem("getBankAddress");
	var loanID = $("#loanData").val();

	var formData = new FormData(this);
	$("#waitingModal").modal();
	 
    $.ajax({
        url: "/docUpload",
        type: 'POST',
        data: formData,
	cache: false,
        contentType: false,
        processData: false,
        success: function (result) {

   
			
			$.ajax({

					dataType: "json",
					contentType: 'application/json; charset=UTF-8',
		url: "/updatePortfolioStatus?sharedOwnerAddress="+bankAddress+"&loanId="+loanID+"&status=docs_uploaded&message=verify_docs",
					type: "POST",
					global: false,
					async: false,
					success: function (response) {
			
                        document.getElementById("txId").innerHTML = response.message;
                        $('#waitingModal').modal('hide');
                        $("#successModal").modal();
                       

				      
				        setTimeout(function () {
				                window.location.href = "CustomerDashboard.html";
				        }, 2000);
			


					}
				});


                }
        });

});



/*



          	alert(JSON.stringify(result));

	  
                        document.getElementById("txId").innerHTML = result.tx_id;
                        $('#waitingModal').modal('hide');
                        $("#successModal").modal();
	setTimeout(function(){ 
             
			 window.location.href="CustomerDashboard.html";
			 return false;
      
          }, 1000);
        },
        cache: false,
        contentType: false,
        processData: false
    });
});
*/
