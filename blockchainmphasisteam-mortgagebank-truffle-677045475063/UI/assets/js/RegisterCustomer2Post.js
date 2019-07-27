
      

$('#button3').click(function () {
        //alert('clicked');
	document.getElementById("registerCustomerform").style.display = "none";

        var  firstName = $("#f1-first-name").val();
	var  lastName = $("#f1-last-name").val();
	var  mobileNumber = $("#f1-phoneNo").val();
	var  emailId = $("#f1-email").val();
	var  password = $("#f1-password").val();


        
        $("#waitingModal").modal();

        $.ajax({

                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                url: "/createAccount?&firstName="+firstName+"&lastName="+lastName+"&mobileNumber="+mobileNumber+"&emailId="+emailId+"&password="+password,
                type: "POST",
                global: false,
                async: false,
                success: function (result) {
                      //  alert(JSON.stringify(result));
                        
                      
                        document.getElementById("txId").innerHTML = result.tx_id;
                        $('#waitingModal').modal('hide');
                        $("#successModal").modal();
                       
                        
                        setTimeout(function () {
                                window.location.href = "Landing.html";
                        }, 2000);
                        // ViewTokenForBaggage.html?baggageId=5615192
                }
        });

});

