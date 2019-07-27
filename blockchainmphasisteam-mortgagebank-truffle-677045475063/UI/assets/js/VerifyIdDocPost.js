$('#button3').click(function () {
        //alert('clicked');

        var loanId = $("#loanId").val();
	var bankAddress	 = localStorage.getItem("getBankAddress")


        $.ajax({

                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                url: "/updatePortfolioStatus?sharedOwnerAddress="+bankAddress+"&loanId="+loanId+"&status=post_approval_pending&message=upload_tax_documents",
                type: "POST",
                global: false,
                async: false,
                success: function (result) {
                        //alert(result);
                        document.getElementById("txWaiting").style.display = "none";
                        document.getElementById("txIdData").innerHTML = result.txId;
                        document.getElementById("txMessageForm").style.display = "block";
                        setTimeout(function () {
                                window.location.href = "PortfolioForBank.html";
                        }, 2000);
                        // ViewTokenForBaggage.html?baggageId=5615192
                }
        });

});

