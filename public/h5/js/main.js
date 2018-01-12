window.addEventListener("touchend", onTouchEvent);
window.addEventListener("push", onPushEvent);
var requestUrl = "";
function onTouchEvent(e) {
  //
}
function onPushEvent(e){
  /*if (e.detail.state.url){
    requestUrl = e.detail.state.url;
  }
	alert(requestUrl)*/
  eval($("#pageScript").text());
}