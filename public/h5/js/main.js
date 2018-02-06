window.addEventListener("touchend", onTouchEvent);
window.addEventListener("push", onPushEvent);
var requestUrl = "";
function onTouchEvent(e) {
  var obj = e.target || e.srcElement;
  var item = $(obj).closest(".table-view-cell");
  if (item.length > 0) {
      item.next(".table-view-cell-content").toggle();
  }
}
function onPushEvent(e){
  if (e.detail.state.url){
    requestUrl = e.detail.state.url;
  }
  setTimeout(init, 100);
  eval($("#pageScript").text());
}

var pno = 1;
var finish = 0;
var loading = 0;
var requestUrl = location.href;
$(document).ready(function(){
	init();
});

function init(){
	pno = 1;
	finish = 0;
	loading = 0;
	bindContent();
}

function bindContent(){
	$(".content").scroll(function(){
		if (finish == 1 || $("#last").length == 0) return;
		var top = $("#last").position().top + 5;
		var se = document.documentElement.clientHeight;
		if(top <= se && loading == 0) { 
		   loading = 1;
       if (loadMoreData) loadMoreData();
		}
	});
}