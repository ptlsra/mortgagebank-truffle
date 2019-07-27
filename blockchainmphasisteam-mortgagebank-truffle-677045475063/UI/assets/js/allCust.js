$(document).ready(function(){

	 var tempLists=[];
	 var dataSets=[];
	 
	
	// alert(ipAddress);
	
	
	
	 
	/* var ipAddress= localStorage.getItem("ipAddress");
	 var port= localStorage.getItem("port");
	  var ipAddress=ipAdd();
	 var port=portNo();
	 var ipfs=ipfsPortNo();
	 localStorage.setItem("ipAddress", ipAddress);
	 localStorage.setItem("port", port);
	 localStorage.setItem("port2", ipfs);

    */    	
       $.get("/getAllWallets", function(response){
    	  // alert(JSON.stringify(response));
 			$.each(response, function(i, item) {
 				
 			//	http://172.21.80.81:5000/getCustomerNameByWalletAddress?walletAddress=0xff2d218700a917c3aa0e9e72aef6fd7b0cd52512
 				//alert(JSON.stringify(item));
 				//alert(JSON.stringify(response.message[0]));
 				
				//tempLists.push(i,item.requestId,item.requestBy,item.status,'<a  href=LoanRequestApproval?'+item.requestId+'> View Details',"");
 				
 				//tempLists.push(i,item.,item.craft,item.name,'<a  href=LoanRequestApproval?'+item.craft+'> View Details',"");
 				
 				var name =item.name;
 				name=name.charAt(0).toUpperCase() + name.slice(1);
 				
 				var replaced = name.split(' ').join('_');
 				tempLists.push(i+1,name,'<a title="'+ item.wallet+'"href=#?'+item.wallet+ '>'+item.wallet.substr(0, 20)+'....','<a  href=BankCustomerPortfolio.html?walletAddress='+item.wallet+'&name='+replaced+'&userName='+item.userName+'> View ','<a  href=CustomerDetails.html?walletAddress='+item.wallet+'&name='+replaced+'> View Customer Details');

				dataSets.push(tempLists);
				tempLists=[];
 				name="";
				//alert(dataSet);		               
				 			        	
			});
				//$('#res').dataTable();

		//alert(dataSet);
		$('#pendingRequest2').DataTable( {
			data: dataSets,
			columns: [
				 { title: "SNo" },
				 {title :"Customer's Name"},
			    { title: "Customer Address" },
			    {title :"View Portfolios"},
			    {title :"Customer Info"}
			    
			    
			    
			    

			  
			]
    		} );
        } );
        
        
        });