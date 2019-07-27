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
		
		//var walletAddress = getUrlParameter('walletAddress');
		//var name = getUrlParameter('name');
		
		//var replaced = name.split('_').join(' ');
	//	 document.getElementById("titleLoanText").innerHTML = "Loan Details  For Customer : "+replaced;
		 
		// document.getElementById("titleLoanTaxDoc").innerHTML = "All Loans For Customer : "+replaced;
		
		//localStorage.setItem("bankWalletAddress", walletAddress);
	 
	// var walletAddress=localStorage.getItem("walletAddress");
		
		 var ipAddress=ipAdd();
		 var port=portNo();
		 var ipfs=ipfsPortNo();
		// alert(ipAddress);
		
		
		localStorage.setItem("ipAddress", ipAddress);
		 localStorage.setItem("port", port);
		 localStorage.setItem("port2", ipfs);
		/*
		 var ipAddress= localStorage.getItem("ipAddress");
		 var port= localStorage.getItem("port");
*/
	        	
	      // $.get("http://"+ipAddress+":"+port+"/getAllWallets", function(response){
		 
		 
		 

		 
		 
		 
		 
		 
		 
		 $.ajax({
		     async: false,
		     type: 'GET',
		     url: "/getAllCustomerLoans",
		     success: function(response) {
		          //alert(JSON.stringify(data));
		       },
		     complete: function(data){
		        
		    	 //console.log("Check ------------------");
		    	// console.log(data)
		    	 
		    	 
		    	 count=0;
		    		$.each(data.responseJSON, function(i, item) {
		 				//alert(JSON.stringify(item));
		 				//alert(JSON.stringify(response.message[0]));
		 				var walletAddress=item.owner;
		 				//alert(item.userName);
		 				if(item.portfolioStatus=="Insurance_approved"){
		 					tempLists.push(i+1,item.loanId,'Insurance Approved',' Policy Issued','<a  href=InsuranceComplete.html?loanId='+item.loanId+'&name='+name+'&walletAddress='+walletAddress+'&status=Policy_Issued&currentAction=Approve_Poilcy>View And Approve','<a  href=PreviousHistoryBank.html?loanId='+item.loanId+'&userName='+item.userName+'> View ');
		 					dataSets.push(tempLists);
		 				//count=count;
		 	 	 				}
		 				if(item.portfolioStatus=="Loan_Approved"){
		 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
		 				//count=count;
		 	 	 				}
						//tempLists.push(i,item.requestId,item.requestBy,item.status,'<a  href=LoanRequestApproval?'+item.requestId+'> View Details',"");
		 			
		 				
		 				else{
		 					
		 				if(item.portfolioStatus=="initial_approval_pending"){
		 					count++;
		 				tempLists.push(count,item.loanId,item.ownerName,"New Request",'Pending Approval','<a  href=LoanDetails.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View and Approve');

						dataSets.push(tempLists);
						tempLists=[];
		 				}
		 				
		 				if(item.portfolioStatus=="pre_approval_pending"){
		 					count++;
		 	 				//tempLists.push(i+1,item.loanId,'Pre Approval Pending','Waiting For ID Docs.','<a  href=LoanDetailsApproved.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'>View Details');
		 	 				tempLists.push(count,item.loanId,item.ownerName,'Pre Approval Pending','<a  href=LoanDetailsApproved.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'>Waiting For  Docs','');

		 					dataSets.push(tempLists);
		 					tempLists=[];
		 	 				}
		 				
		 				
		 				if(item.portfolioStatus=="docs_uploaded"){
		 					count++;
		 	 				tempLists.push(count,item.loanId,item.ownerName,'Verification Pending',' Docs Uploaded ','<a  href=VerifyTaxDocumentBank.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View And Approve');

		 					dataSets.push(tempLists);
		 					tempLists=[];
		 	 				}
		 				
		 				if(item.portfolioStatus=="identity_docs_uploaded"){
		 					count++;
		 	 				tempLists.push(count,item.loanId,item.ownerName,'Verification Pending','ID docs Uploaded ','<a  href=VerifyDocumentBank.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View And Approve');

		 					dataSets.push(tempLists);
		 					tempLists=[];
		 	 				}
		 				
		 				if(item.portfolioStatus=="post_approval_pending"){
		 					count++;
		 	 				tempLists.push(count,item.loanId,item.ownerName,'Verified ID docs','<a  href=VerifyDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Waiting For Tax Docs','');

		 					dataSets.push(tempLists);
		 					tempLists=[];
		 	 				}
		 				if(item.portfolioStatus=="tax_docs_uploaded"){
		 					count++;
		 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
		 	 				tempLists.push(count,item.loanId,item.ownerName,'Verification Pending','Tax docs Uploaded ','<a  href=VerifyTaxDocumentBank.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View And Approve');
		 					dataSets.push(tempLists);
		 					tempLists=[];
		 	 				}
		 				
		 				
		 				if(item.portfolioStatus=="insurance_pending"){
		 					count++;
		 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
			 	 				tempLists.push(count,item.loanId,item.ownerName,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','');
			
		 					//tempLists.push(i+1,item.loanId,'Verified Tax Documents','Insurance Pending','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View Details');
		 	 					dataSets.push(tempLists);
		 	 					tempLists=[];
		 	 	 				}
		 	 				
		 				if(item.portfolioStatus=="insurance_approval_pending"){
		 					count++;
		 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
			 	 				tempLists.push(count,item.loanId,item.ownerName,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','');
			
		 					//tempLists.push(i+1,item.loanId,'Verified Tax Documents','Insurance Pending','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View Details');
		 	 					dataSets.push(tempLists);
		 	 					tempLists=[];
		 	 	 				}
		 			
		 				
		 				if(item.portfolioStatus=="insurance_quote_approved"){
		 					count++;
		 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
			 	 				tempLists.push(count,item.loanId,item.ownerName,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','');

		 					//	tempLists.push(i+1,item.loanId,'Verified Tax Documents','Insurance Pending','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View Details');
		 	 					dataSets.push(tempLists);
		 	 					tempLists=[];
		 	 	 				}
		 				if(item.portfolioStatus=="customer_quote_approved"){
		 					count++;
		 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
			 	 				tempLists.push(count,item.loanId,item.ownerName,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','');

		 					//	tempLists.push(i+1,item.loanId,'Verified Tax Documents','Insurance Pending','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> View Details');
		 	 					dataSets.push(tempLists);
		 	 					tempLists=[];
		 	 	 				}
		 				
		 				
		 				if(item.portfolioStatus=="property_details_uploaded"){
		 					count++;
		 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
		 	 	 				tempLists.push(count,item.loanId,item.ownerName,'Verified Tax Documents','<a  href=VerifyTaxDocumentBankCompleted.html?loanId='+item.loanId+'&walletAddress='+walletAddress+'&name='+name+'> Insurance Pending','');
		 	 					dataSets.push(tempLists);
		 	 					tempLists=[];
		 	 	 				}
		 				
		 				
		 				if(item.portfolioStatus=="ins_completed"){
		 					count++;
		 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
		 	 	 			//	tempLists.push(i+1,item.loanId,'Insurance Approved','Ready For Disbursal','<a  href=ViewQuotesVerified2.html?loanId='+item.loanId+'&name='+name+'> View Details');
		 					
		 				//	tempLists.push(i+1,item.loanId,'Insurance Approved','Ready For Disbursal','<a  href=ViewQuotesVerified2.html?loanId='+item.loanId+'&name='+name+'> View Details');
		 					
		 					tempLists.push(count,item.loanId,item.ownerName,'Insurance Approved','<a  href=ViewQuotesVerified2.html?loanId='+item.loanId+'&name='+name+'> Ready For Disbursal','');
		 	 					dataSets.push(tempLists);
		 	 					tempLists=[];
		 	 	 				}
		 				

		 				
		 				
		 				
		 				
		 				
		 				//post_approval_pending
		 				
						//alert(dataSet);		               
		 			}	 			        	
					});
		    		
		    		setTimeout(function(){ 
				   		$('#pendingRequest9').DataTable( {
				   			data: dataSets,
				   	//	 deferRender:    true,
				       //     scrollY:        700,
				       //     scrollCollapse: true,
				        //    scroller:       true,
				   			columns: [
				   				 { title: "SNo" },
				   			    { title: "Loan ID" },
				   			    { title: "Customer's Name" },
				   			    { title: "Status Of Loan" },
				   			    { title: " Current Action " },
				   			    {title: "Details  "}
				   			    
				   			    
				   			    
				   			    

				   			  
				   			]
				       		} );
				    			}, 7000);
		       }
		});
		 
		 $(document).ajaxStop(function() {
			alert("done");
			});
		 
});
