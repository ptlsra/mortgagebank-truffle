$('#regButtonSubmit').click(function () {


        var walletAddress =  localStorage.getItem("walletAddress");
        var loanType = $("#loanType").val();
        var loanTerm = $("#loanTerm").val();
        var propertyType = $("#propertyType").val();
        var loanPurpose = $("#loanPurpose").val();
       // var downPayment = document.getElementById("f1-downPayment").innerHTML
        var interestType = document.getElementById("f1-interestType").innerHTML
        var propertyAddress = document.getElementById("f1-propertyAddress").innerHTML
      // var purchasePrice = document.getElementById("f1-PurchasePrice").innerHTML
 	var downPayment = $("#f1-down-payment").val();
	var purchasePrice = $("#f1-purchase-price").val();



$("#waitingModal").modal();


$.ajax({

                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                url: "/createPortfolio?walletAddress=" + walletAddress + "&loanType=" + loanType + "&interestType=" + interestType + "&loanTerm=" + loanTerm + "&purchasePrice=" + purchasePrice+ "&propertyType=" + propertyType+ "&propertyAddress=" + propertyAddress+ "&loanPurpose="+loanPurpose+"&downPayment="+downPayment,
                type: "POST",
                global: false,
                async: false,
                success: function (result) {
		


         
	
                        document.getElementById("txId").innerHTML = result.message.tx_id;
                        $('#waitingModal').modal('hide');
                        $("#successModal").modal();
                       

                        setTimeout(function () {
                // page for redirection
                                window.location.href = "CustomerDashboard.html";
                        }, 2000);
                }
        });



});
