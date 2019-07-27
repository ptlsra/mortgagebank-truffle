$('#button3').click(function () {
        //alert('clicked');

        var userName = $("#userName").val();
        var password = $("#password").val();



        $.ajax({

                dataType: "json",
                contentType: 'application/json; charset=UTF-8',
                url: "/authenticate?userName="+userName+"&password="+password,
                type: "GET",
                global: false,
                async: false,
                success: function (result) {
			
                   //     alert(JSON.stringify(result));
                      
                        localStorage.setItem("walletAddress",result.message.customerAddress); 
                        localStorage.setItem("Name",result.message.name);
                        localStorage.setItem("userName",result.message.userName); 
                        localStorage.setItem("phoneNo",result.message.mobileNumber); 
                        localStorage.setItem("email",result.message.emailId);
                        localStorage.setItem("password",password); 
                        localStorage.setItem("responseValue","nil"); 
 
 


 

                        setTimeout(function () {
                                window.location.href = "CustomerDashboard.html";
                        }, 2000);
                        // ViewTokenForBaggage.html?baggageId=5615192
                }
        });

});

