$(document).ready(function(){

	 var tempLists=[];
	 var dataSets=[];
	 

        	var email=localStorage.getItem("email");
        	var ipAddress=ipAdd();
        	var port=portNo();
        	var ipfs=ipfsPortNo();
        	//alert(ipAddress);


        	localStorage.setItem("ipAddress", ipAddress);
        	localStorage.setItem("port", port);
        	localStorage.setItem("port2", ipfs);
        	/*
        	
        	var ipAddress= localStorage.getItem("ipAddress");
       	 var port= localStorage.getItem("port");
*/
               	
             // $.get("http://"+ipAddress+":"+port+"/getAllWallets", function(response){
       	$.get("/getCustomerTransactions?userName="+email, function(response){
    	 //  alert(JSON.stringify(response));
 			$.each(response, function(i, item) {
 				//alert(JSON.stringify(item));
 				//alert(JSON.stringify(response.message[0]));
 				
				//tempLists.push(i,item.requestId,item.requestBy,item.status,'<a  href=LoanRequestApproval?'+item.requestId+'> View Details',"");
 				
 			//	tempLists.push(i+1,item.name,item.craft,item.name,'<a  href=LoanRequestApproval?'+item.craft+'> View Details',"");
 				
 				
 				
 				var timeValue=item.dateTime.toString().slice(0,-9);
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
 				 
 				// document.getElementById('datetime').innerHTML = convdataTime;
 				var desc=item.description;
 				 var replacedDesc = desc.split('_').join(' ');
 				
 				
 				tempLists.push(i+1,'<a title="'+ item.transactionId+'"href=#?'+item.transactionId+ '>'+item.transactionId.substr(0, 20)+'....',convdataTime,replacedDesc);
 				
				dataSets.push(tempLists);
				tempLists=[];
 				
				//alert(dataSet);		               
				 			        	
			});
				//$('#res').dataTable();

		//alert(dataSet);
		$('#pendingRequest').DataTable( {
			data: dataSets,
			columns: [
				 { title: "SNo" },
			    { title: "Transcation Id" },
			    {title: "TimeStamp "},
			    {title: "Description"}
			    
			    
			    
			    
			    

			  
			]
    		} );
        } );
        
        
        });
