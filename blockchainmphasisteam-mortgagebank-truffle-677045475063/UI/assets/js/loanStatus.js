$(document).ready(function(){
	var modal = document.getElementById('myModal');

	var btn = document.getElementById("myBtn");

	var span = document.getElementsByClassName("close")[0];
	modal.style.display = "block";

	 var tempLists=[];
	 var dataSets=[];
	 
	 var walletAddress=localStorage.getItem("walletAddress");
	 var Name3=localStorage.getItem("Name");
	 //var userName=localStorage.getItem("userName");
	 var Name4=Name3.charAt(0).toUpperCase() + Name3.slice(1);
	 var replaced = Name4.split(' ').join('_');
	
	 /*
	 var ipAddress="52.52.172.203";
	 //var ipAddress="172.21.80.81";
	 var port="5000";
*/
	 
	 var ipAddress=ipAdd();
 	var port=portNo();
 	var ipfs=ipfsPortNo();
   	var email=localStorage.getItem("email");
 	//alert(ipAddress);
	var index=0;

	 $.get("/getAllPortfolios?walletAddress="+walletAddress, function(response){
   
 			$.each(response, function(i, item) {
 				var loanId=item.loanId;
 				
 	$.get("/getCustomerTransactionsByLoanId?userName="+email+"&loanId="+loanId, function(responseval){
 	
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
				 
 				if(item.portfolioStatus=="initial_approval_pending"){
 				tempLists.push(index,item.loanId,"Request Submitted",'<a  href=InitialDetails.html?loanId='+item.loanId+'&status=Request_Submitted&currentAction=Pending_Bank_Approval> Pending Bank Approval','',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');

				dataSets.push(tempLists);
				tempLists=[];
 				}
 				
 				if(item.portfolioStatus=="pre_approval_pending"){
 	 			//	tempLists.push(i+1,item.loanId,'Pre Approval Pending','Upload Identity Documents','<a  href=UploadIdentityDocuments.html?loanId='+item.loanId+'&name='+replaced+'> View and Upload');
 	 	 		tempLists.push(index,item.loanId,'Pre Approval Pending','Upload Documents','<a  href=UploadDocuments.html?loanId='+item.loanId+'&name='+replaced+'> View and Upload',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');

 					dataSets.push(tempLists);
 					tempLists=[];
 	 				}
 				
 				if(item.portfolioStatus=="docs_uploaded"){
 	 	 			//	tempLists.push(i+1,item.loanId,'Pre Approval Pending','Upload Identity Documents','<a  href=UploadIdentityDocuments.html?loanId='+item.loanId+'&name='+replaced+'> View and Upload');
 					tempLists.push(index,item.loanId,'Bank Verification Pending','<a  href=UploadDocumentsDone.html?loanId='+item.loanId+'&name='+replaced+'> Documents Uploaded','',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');

 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 	 				
 				
 				
 				if(item.portfolioStatus=="identity_docs_uploaded"){
 	 				tempLists.push(index,item.loanId,'Bank Verification Pending','<a  href=UploadIdentityDocumentsDone.html?loanId='+item.loanId+'&name='+replaced+'> ID docs Uploaded','',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');

 					dataSets.push(tempLists);
 					tempLists=[];
 	 				}
 				if(item.portfolioStatus=="post_approval_pending"){
 	 				tempLists.push(index,item.loanId,'ID docs Verified','Upload tax Documents ','<a  href=UploadTaxDocuments.html?loanId='+item.loanId+'&name='+replaced+'> View And Upload',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');

 					dataSets.push(tempLists);
 					tempLists=[];
 	 				}
 				if(item.portfolioStatus=="tax_docs_uploaded"){
 	 				tempLists.push(index,item.loanId,'Bank Verification Pending','<a  href=UploadTaxDocumentsDone.html?loanId='+item.loanId+'&name='+replaced+'> Tax Docs Uploaded','',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');

 					dataSets.push(tempLists);
 					tempLists=[];
 	 				}

 				if(item.portfolioStatus=="insurance_pending"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 				tempLists.push(index,item.loanId,'Tax Documents Verified','Apply Insurance','<a  href=ApplyInsCust.html?loanId='+item.loanId+'&name='+replaced+'> View and Apply',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				if(item.portfolioStatus=="insurance_approval_pending"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 				tempLists.push(index,item.loanId,'Insurance Confirmation Pending','<a  href=ViewQuotes.html?loanId='+item.loanId+'&name='+replaced+'> Quotes Placed','',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				if(item.portfolioStatus=="insurance_quote_approved"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 				tempLists.push(index,item.loanId,' Pending Customer Approval','Initial Approval Recieved','<a  href=ViewQuotes.html?loanId='+item.loanId+'&name='+replaced+'> View and Approve',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				if(item.portfolioStatus=="customer_quote_approved"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 				tempLists.push(index,item.loanId,'You have Approved Ins Proposal','Update Details','<a  href=ViewQuotes.html?loanId='+item.loanId+'&name='+replaced+'> Update Property Info',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				
 				if(item.portfolioStatus=="property_details_uploaded"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 				tempLists.push(index,item.loanId,'Verification Pending','<a  href=ViewQuotesUpdated.html?loanId='+item.loanId+'&name='+replaced+'> Property Details Updated','',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				if(item.portfolioStatus=="ins_completed"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 				tempLists.push(index,item.loanId,'Insurance Approved','<a  href=ViewQuotesRequest.html?loanId='+item.loanId+'&name='+replaced+'> Ready For Disbursal','',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				if(item.portfolioStatus=="Insurance_approved"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 				tempLists.push(index,item.loanId,'Insurance Approved','<a  href=ViewApprovedQuotes.html?loanId='+item.loanId+'&name='+replaced+'> Policy Issued.Waiting For Bank Approval','',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				
 				if(item.portfolioStatus=="Loan_Approved"){
 	 	 			//	tempLists.push(i,item.loanId,'Bank Verification Pending','Tax docs Uploaded ','Please Wait');
 	 	 				tempLists.push(index,item.loanId,'Loan Approved','<a  href=ViewApprovedQuotes.html?loanId='+item.loanId+'&name='+replaced+'> Ready For Disbursal','',convdataTime,'<a  href=PreviousHistory.html?loanId='+item.loanId+'> View ');
 	 					dataSets.push(tempLists);
 	 					tempLists=[];
 	 	 				}
 				
 				
 				
 				
 			
 	});	
 				
				//alert(dataSet);		               
				 			        	
			});
				//$('#res').dataTable();

		//alert(dataSet);
			 setTimeout(function(){ 

		$('#pendingRequest').DataTable( {
			data: dataSets,
			columns: [
				 { title: "SNo" },
			    { title: "Loan ID" },
			    { title: "Current Status Of Loan" },
			    { title: " Current Action " },
			    {title: "Action Details  "},
			  
			    {title :"Time Stamp Of Action"},
			    {title :"History"}
			    
			    
			    
			    

			  
			]
    		} );
		modal.style.display = "none";
			 }, 5500);
        } );
        
        
        });
