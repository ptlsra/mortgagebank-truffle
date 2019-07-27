$(document).ready(function(){

$("#e").hide();
	 $("#f").show();
	 $("#nav_bar2").hide();  
	 $("#namanyay-search-box").hide();

	 $("#namanyay-search-btn").on('focus', function () {
	 	 $("#a").hide();
	 	 $("#b").hide();
	 	 $("#c").hide();
	 	 $("#d").hide();
	 	 $("#f").hide();
	 	 $("#e").show();

	 	
	 	 $("#namanyay-search-box").show();
	    
	 });
	 $("#namanyay-search-box").on('blur', function () {
		 $("#a").show();
		 $("#b").show();
		 $("#c").show();
		 $("#d").show();
		 $("#f").show();
		 $("#e").hide();
		 $("#namanyay-search-box").hide();

	  
	});
$(function(){
      $("#includedContent").load("commonHeader.html"); 
    });
});