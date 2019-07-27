$(document).ready(function(){

	 var tempLists=[];
	 var dataSets=[];
	 
	 var getUrlParameter = function getUrlParameter(sParam) {
		    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		        sURLVariables = sPageURL.split('&'),
		        sParameterName,
		        i;

		    for (i = 0; i < sURLVariables.length; i++) {
		        sParameterName = sURLVariables[i].split('=');

		        if (sParameterName[0] === sParam) {
		            return sParameterName[1] === undefined ? true : sParameterName[1];
		        }
		    }
		};
		
		 var ipAddress=ipAdd();
		 var port=portNo();
		 var ipfs=ipfsPortNo();
		// alert(ipAddress);
		
		
	
		
		var walletAddress = getUrlParameter('walletAddress');
		var userName = getUrlParameter('userName');
		var name = getUrlParameter('name');
		
		var replaced = name.split('_').join(' ');
		 document.getElementById("titleLoanText").innerHTML = "Loan Details  For Customer : "+replaced;
		 
		// document.getElementById("titleLoanTaxDoc").innerHTML = "All Loans For Customer : "+replaced;
		
		localStorage.setItem("bankWalletAddress", walletAddress);
	// alert(walletAddress);
	// var walletAddress=localStorage.getItem("walletAddress");
		
		
		
		/*
		 var ipAddress= localStorage.getItem("ipAddress");
		 var port= localStorage.getItem("port");


	localStorage.setItem("ipAddress", ipAddress);
		 localStorage.setItem("port", port);
		 localStorage.setItem("port2", ipfs);
*/
	        	
	      // $.get("http://"+ipAddress+":"+port+"/getAllWallets", function(response){
        	var index=0;
       $.get("/getAllPortfolios?walletAddress="+walletAddress, function(response){
    //	alert(JSON.stringify(response));
 			$.each(response, function(i, item) {
 				var loanIdDetail=item.loanId;
 	$.get("/getCustomerTransactionsByLoanId?userName="+userName+"&loanId="+loanIdDetail, function(responseval){
 		//alert(responseval[0].description);
 		
 			index++;

				var timeValue=responseval[0].dateTime.toString().slice(0,-9);
				// var unixtimestamp = item.dateTime;
				var unixtimestamp = timeValue;

				 // Months array
				 var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

				 // Convert timestamp to milliseconds
				 var date = new Date(unixtimestamp*1000);

				 // Year
				 var year = date.getFullYear();

				 // Month
				 var month = months_arr[date.getMonth()];

				 // Day
				 var day = date.getDate();

				 // Hours
				 var hours = date.getHours();

				 // Minutes
				 var minutes = "0" + date.getMinutes();

				 // Seconds
				 var seconds = "0" + date.getSeconds();

				 // Display date time in MM-dd-yyyy h:m:s format
				 var convdataTime = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
		//	alert(convdataTime);
				 //tempLists.push(i,item.requestId,item.requestBy,item.status,'<a  href=LoanRequestApproval?'+item.requestId+'> View Details',"");
 				if(item.portfolioStatus=="initial_approval_pending"){
 				tempLists.push(index,item.loanId,"New Request",'Pending Approval','<a  href=LoanDetails.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View and Approve','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
				dataSets.push(tempLists);
				tempLists=[];
 				}
 				
 				if(item.portfolioStatus=="pre_approval_pending"){
 	 				//tempLists.push(i+1,item.loanId,'Pre Approval Pending','Waiting For ID Docs.','<a  href=LoanDetailsApproved.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'>View Details');
 	 				tempLists.push(index,item.loanId,'Pre Approval Pending','<a  href=LoanDetailsApproved.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'>Waiting For  Docs','','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);

 					dataSets.push(tempLists);
 					tempLists=[];
 	 				}
 				
 				
 				if(item.portfolioStatus=="docs_uploaded"){
 	 				tempLists.push(index,item.loanId,'Verification Pending',' Docs Uploaded ','<a  href=VerifyTaxDocumentBank.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View And Approve','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);

 					dataSets.push(tempLists);
 					tempLists=[];
 	 				}
 				
 				if(item.portfolioStatus=="identity_docs_uploaded"){
 	 				tempLists.push(index,item.loanId,'Verification Pending','ID docs Uploaded ','<a  href=VerifyDocumentBank.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View And Approve','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
 					dataSets.push(tempLists);
 					tempLists=[];
 	 				}
 				
 				if(item.portfolioStatus=="post_approval_pending"){
 	 				tempLists.push(index,item.loanId,'Verified ID docs','<a  href=VerifyDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Waiting For Tax Docs','','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
 					dataSets.push(tempLists);
 					tempLists=[];
 	 				}
 				if(item.portfolioStatus=="tax_docs_uploaded"){
 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 				tempLists.push(index,item.loanId,'Verification Pending','Tax docs Uploaded ','<a  href=VerifyTaxDocumentBank.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View And Approve','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
 					dataSets.push(tempLists);
 					tempLists=[];
 	 				}
 				
 				
 				if(item.portfolioStatus=="insurance_pending"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
	 	 				tempLists.push(index,item.loanId,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
	
 					//tempLists.push(i+1,item.loanId,'Verified Tax Documents','Insurance Pending','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View Details');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 	 				
 				if(item.portfolioStatus=="insurance_approval_pending"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
	 	 				tempLists.push(index,item.loanId,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
	
 					//tempLists.push(i+1,item.loanId,'Verified Tax Documents','Insurance Pending','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View Details');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 			
 				
 				if(item.portfolioStatus=="insurance_quote_approved"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
	 	 				tempLists.push(index,item.loanId,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);

 					//	tempLists.push(i+1,item.loanId,'Verified Tax Documents','Insurance Pending','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View Details');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				if(item.portfolioStatus=="customer_quote_approved"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
	 	 				tempLists.push(index,item.loanId,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);

 					//	tempLists.push(i+1,item.loanId,'Verified Tax Documents','Insurance Pending','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View Details');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				
 				if(item.portfolioStatus=="property_details_uploaded"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 				tempLists.push(index,item.loanId,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				
 				if(item.portfolioStatus=="ins_completed"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 			//	tempLists.push(i+1,item.loanId,'Insurance Approved','Ready For Disbursal','<a  href=ViewQuotesVerified2.html?loanId='+item.loanId+'&name='+name+'> View Details');
 					
 				//	tempLists.push(i+1,item.loanId,'Insurance Approved','Ready For Disbursal','<a  href=ViewQuotesVerified2.html?loanId='+item.loanId+'&name='+name+'> View Details');
 					
 					tempLists.push(index,item.loanId,'Insurance Approved','<a  href=ViewQuotesVerified2.html?loanId='+item.loanId+'&name='+name+'> Ready For Disbursal','','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				

 				if(item.portfolioStatus=="Insurance_approved"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 					tempLists.push(index,item.loanId,'Insurance Approved',' Policy Issued','<a  href=InsuranceComplete.html?loanId='+item.loanId+'&name='+name+'&walletAddress='+walletAddress+'&status=Policy_Issued&currentAction=Approve_Poilcy>View And Approve','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				if(item.portfolioStatus=="Loan_Approved"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 					tempLists.push(index,item.loanId,' Loan Approved','<a  href=InsuranceCompleteDone.html?loanId='+item.loanId+'&name='+name+'&walletAddress='+walletAddress+'&status=Loan_Approved&currentAction=Completed>Ready For Disbursal','','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+userName+'> View ',convdataTime);
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				
 				
 		
 		//post_approval_pending
 				
 		});	//alert(dataSet);		               
				 			        	
			});
				//$('#res').dataTable();

		//alert(dataSet);
 			 setTimeout(function(){ 
		$('#pendingRequest3').DataTable( {
			data: dataSets,
			columns: [
				 { title: "SNo" },
			    { title: "Loan ID" },
			    { title: "Current Status Of Loan" },
			    { title: " Current Action " },
			    {title: "Action Details  "},
			    {title :"History"},
			    {title :"Time Stamp Of Action"}
			    
			    
			    
			    

			  
			]
    		} );
 			}, 2500);
 			
        } );
       
});
