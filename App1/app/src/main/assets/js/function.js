/*--README INFORMATION--
IMPORTANT FUNCTIONS
a) DATA OPERATION FUNCTIONS
create_objs(objs,args) -- Create or Update Objects // This can accept full-recursive object data and semi-recursive object data separated by pointers
query_key(type,condition,args){ -- Get Objects only including KEY INFO in a table structure //First Step to Interact with SYSTEM
get_objs(type,ids,args) -- Get Object Tree by SYSTEM ID // Semi-Recursive (Only one layer children)// Full-Recursive Not Implemented // Second Step to Interact with the SYSTEM
b) AJAX CALLBACK FUNCTIONS (All the following functions work together to show/edit data in UI layer)
list_data() -- Show 2d array from backend in a table
show_data_by_treeview() -- show standard Object structure from backend as a tree view 
sync_data() -- copying the back-end data structure to front-end javascript data variable
register_data() -- data binding between UI controls and javascript data variable, used to package standard object tree structure for backend interaction
register_condition() -- data binding between UI controls and javascript data variable, used to package query condition for backend interaction
*///--END README INFORMATION--

/*variables*/
var data = {};
var display_stack = [];
var inputKeyCodes = {};for(var i=48;i<=90;i++){inputKeyCodes[i] = '';}for(var i=186;i<=192;i++){inputKeyCodes[i] = '';}for(var i=219;i<=222;i++){inputKeyCodes[i] = '';}
/*end variables*/
/*data operation*/
/*end data operation*/

/*register&login*/
function register(name,email,pass,args){
	var array = {};
	array['password'] = pass;
	array['name'] = name;
	array['email'] = email;
	args['array'] = array;
	//set callback
		if(typeof(args['callback'])!='undefined'){
		if(typeOf(args['callback'])=='array'){
			args['callback'].unshift('set_cookie');
		}else{ 
			if(args['callback']===''){
				args['callback'] = ['set_cookie'];
			}else{
				args['callback'] = ['set_cookie',args['callback']];
			}
		}
	}else{
		args['callback'] = ['set_cookie'];
	}
	//end set callback
	
	execute("api.php","POST","register",args);
}
function login(email,pass,args){ 
	args['email'] = email;
	args['password'] = pass;
	//set callback
	if(typeof(args['callback'])!='undefined'){
		if(typeOf(args['callback'])=='array'){
			args['callback'].unshift('set_cookie');
		}else{ 
			if(args['callback']===''){
				args['callback'] = ['set_cookie'];
			}else{
				args['callback'] = ['set_cookie',args['callback']];
			}
		}
	}else{
		args['callback'] = ['set_cookie'];
	}
	//end set callback
	
	execute("api.php","POST","login",args);
}
function set_cookie(obj){ //console.log(obj);
	if(typeof(obj.data.cookie)!=='undefined'){
		if(obj.data.cookie.length>0){
			for(var i = 0;i<obj.data.cookie.length;i++){
				for(var p in obj.data.cookie[i]){//alert(p+"="+obj.data.cookie[i][p]);
					document.cookie = p+"="+obj.data.cookie[i][p];
				}
			}
		}
	}else{
		obj.args['ok'][1] = 0;
		document.getElementById(obj.args.callback_elem).innerHTML = JSON.stringify(obj.data);
		
	}
}
function logout(args){ //console.log(callback_args);
	document.cookie ='user_id=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	document.cookie ='security_token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	document.cookie ='user_name=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	execute("api.php","POST","logout",args);
}
/*end register&login*/

/*ajax*/
function call(class_name, function_name,args,host){
	//alert(getURL());
	if(typeof(host)!='undefined'){
		makeCorsRequest( host +"/cors.php",class_name,function_name,args);
	}else{
		execute("api.php","POST",class_name+'.'+function_name,args);
	}
}
function execute(php,type,func,args){
    if(typeof(data.user_id)!='undefined'&&typeof(data.user_name)!='undefined'&&typeof(data.security_token)!='undefined'){
        args.user_id = data.user_id;
        args.user_name = data.user_name;
        args.security_token = data.security_token;
    }
	var args_json = JSON.stringify(args);
    var xmlhttp;
	display_stack.push("*");
	
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            var result =  xmlhttp.responseText; //console.log(result);
            var obj = JSON.parse(result); //console.log(obj);
			if(typeOf(obj.args["callback"])==='array'){
				obj.args["ok"] = {};
				for(var i=0;i<obj.args["callback"].length;i++){
					if(obj.args["callback"][i]!=''&&typeof(obj.args["ok"][i])==='undefined'){
						window[obj.args["callback"][i]](obj);
						display();
					}
				}
			}else{//console.log(obj.args['callback']);
				if(obj.args["callback"]!=''&&typeof(obj.args["callback"])!=='undefined'){
					window[obj.args["callback"]](obj);
					display();
				}
			}
        }
    }
    if(type=="GET"){
        xmlhttp.open(type,php+"?"+"func="+func+"&args="+args_json);
        xmlhttp.send();
    }else if(type=="POST"){
        xmlhttp.open(type,php,true);
        xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send("php="+php+"&func="+func+"&args="+encodeURIComponent(args_json));
    }
}
function run(function_name,args){
	window[function_name](args);
}
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  var withCredentials = true;
  
  
  if (withCredentials) {
    // XHR for Chrome/Firefox/Opera/Safari.
	//console.log(url);
	var origin = url.substr(0,url.lastIndexOf('/'));
	//console.log(origin);
    xhr.open(method, url, true);
	xhr.withCredentials = true;
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("Access-Control-Allow-Origin", origin);
    xhr.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    xhr.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    //xhr.setRequestHeader("Access-Control-Request-Headers", "X-Requested-With, accept, content-type");
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
	//console.log(2);
    xhr = new XDomainRequest();
    xhr.open(method, url);
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    xhr.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
    //xhr.setRequestHeader("Access-Control-Request-Headers", "X-Requested-With, accept, content-type");
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}
function makeCorsRequest(url,class_name,function_name,args) {
  // This is a sample server that supports CORS.
  //var url = 'http://html5rocks-cors.s3-website-us-east-1.amazonaws.com/index.html';

  if(typeof(data.user_id)!='undefined'&&typeof(data.user_name)!='undefined'&&typeof(data.security_token)!='undefined'){
        args.user_id = data.user_id;
        args.user_name = data.user_name;
        args.security_token = data.security_token;
    }


  var xhr = createCORSRequest('POST', url);
  var request  =  {
	  class_name:class_name,
	  function_name:function_name,
	  args:args
  };
  request = JSON.stringify(request);
  if (!xhr) {
    console.log('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    //var title = xhr.responseText;
    //console.log('Response from CORS request to ' + url + ': ' + title);
	var obj = JSON.parse(xhr.responseText);
	if(obj.args["callback"]!=''&&typeof(obj.args["callback"])!=='undefined'){
		window[obj.args["callback"]](obj);
	}
  };

  xhr.onerror = function() {
    console.log('Woops, there was an error making the request.');
  };

  xhr.send(request);
}
/*end ajax*/

/*ajax callbacks*/
function alert_data(obj){
    alert(JSON.stringify(obj.data));
}
function show_text(obj){
	document.getElementById(obj.args.callback_elem).innerHTML = JSON.stringify(obj.data);
}
function refresh(obj){
	location.reload();
}
function console_data(obj){
	console.log(JSON.stringify(obj));
}
function goto_link(obj){
	
		var page_url = obj.args.goto_link_url;
		var parameters = obj.args.goto_link_parameters;
	//alert(page_url);
	var p_string = "?";
	for(var key in parameters){
		var keys = Object.keys(parameters);
		if(keys[keys.length-1] == key){
			p_string += key+'='+parameters[key];
		}else{
			p_string += key+'='+parameters[key]+'&';
		}
	}
	if(p_string.length===1){ p_string = ""; }
	window.location.href = page_url+p_string;
}
function goto_link_ajax(obj){
		var page_url = obj.args.url;
		var url_parameters = obj.args.url_parameters;
		var parameters = obj.args.session_parameters;
		execute("system_api.php","POST","goto_link",{url:page_url,parameters:parameters,url_parameters:url_parameters});
}
function open_link(obj){
	var page_url = obj.args.open_link_url;
	var parameters = obj.args.open_link_parameters;
	var p_string = "?";
	for(var key in parameters){
		var keys = Object.keys(parameters);
		if(keys[keys.length-1] == key){
			p_string += key+'='+parameters[key];
		}else{
			p_string += key+'='+parameters[key]+'&';
		}
	}
	if(p_string.length===1){ p_string = ""; }
	window.open(page_url+p_string);
}

/*end ajax callbacks*/


/*element operation*/
function add_elem(type,attributes,parent_elem){
    var o = document.createElement(type);
	for(var attr in attributes){
		o[attr] = attributes[attr];
	}
    
	parent_elem = document.getElementById(parent_elem);
    parent_elem.appendChild(o);
	return o;
}
function add_elem_bound_with_data(type,attributes,parent_elem,varname){
	
	var o = add_elem(type,attributes,parent_elem);//alert(o.id+varname);
	bind_data(o.id,varname);
	return o;
}
function update_attr(id,attr_name,attr_value){
    document.getElementById(id).attr_name = attr_value;
}
function add_event(id,event_type,handler_function_name){
    addEventListener(document.getElementById(id),handler_function_name);
}
function remove_elem(elem_id){
	var o = document.getElementById(elem_id);
	if(typeof(o.parentNode)!=='undefined'){
		o.parentNode.removeChild(o);
	}
}
function remove_elem1(elem){
	if(typeof(elem.parentNode)!=='undefined'){
		elem.parentNode.removeChild(elem);
	}
}
function put_last(elem_id){
	var e = id(elem_id); 
	e.parentNode.appendChild(e);
	//console.log(e.parentNode.children);
}
function change_class(elem,old_class,new_class){
	if(typeof(elem)!='undefined'&&elem!=null&&old_class!=''&&new_class!=''){
		var re = new RegExp("(?:^|\s)"+old_class+"(?!\S)");
		elem.className =  elem.className.replace( re , new_class );
	}
}
function add_class(elem,new_class){
	if(typeof(elem)!='undefined'&&elem!=null&&new_class!=''){
		
		if(elem.className.indexOf(new_class)>-1){ 
			
		}else{
			if(elem.className===''){
				elem.className += new_class;
			}else{
				elem.className += " "+new_class;
			}
			
		}
	}
}
function toggle_class(elem,class1,class2){
	var re1 = new RegExp("(?:^|\s)("+class1+")(?!\S)");
	var re2 = new RegExp("(?:^|\s)("+class2+")(?!\S)");
	if(elem.className.match(re1)){ 
		change_class(elem,class1,class2);
	}else if(elem.className.match(re2)){
		change_class(elem,class2,class1);
	}else{
		
	}
}
function get_classes(elem){
	return elem.classList;
}
function remove_class(elem,cname){ 
	elem.classList.remove(cname);
	//elem.className =  elem.className.replace( re , '' );
}
function get_siblings(elem){
	var sibs = [];
	for(var i=0;i<elem.parentNode.children.length;i++){
		if(elem.parentNode.children[i]===elem){}else{
			sibs.push(elem.parentNode.children[i]);
		}
	}
	return sibs;
}
function get_element_index(elem){
	var i = 0;while( (elem = elem.previousElementSibling) != null ) i++;
	return i;
}
function array_remove(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}
function getParentByData(node,data_name,data_value){ //console.log(node);
	if(node.dataset[data_name] == data_value){
		return node;
	}else{
		if(node.parentNode!=null){
			return getParentByData(node.parentNode,data_name,data_value);
		}else{
			return null;
		}		
	}
}
function getElementByTag(elem,tag){
	//console.log(elem);
	if(elem==null){
		console.log(tag);
		return null;
	}
	if(elem!==document){
		if(elem.dataset.tag==tag){
			return elem;
		}
	}
	if(typeof(elem.children)!='undefined'){
		for(var i=0;i<elem.children.length;i++){
			var res = getElementByTag(elem.children[i],tag);
			if(res!=null){
				return res;
			}
		}
	}
	return null;
}
function getElementsByTag(elem,tag,res){
	if(typeof(res)=='undefined'||res==null){ res = []; }
	if(elem!==document){
		if(elem.dataset.tag==tag){
			res.push( elem);
		}
	}
	
	for(var i=0;i<elem.children.length;i++){
		var res = getElementsByTag(elem.children[i],tag,res);
	}
	return res;
}
function hide_original_copy(elem){
	//elem.old_display = elem.style.display;
	elem.style.display = 'none';
	//elem.dataset["tag"] = "";
}
function repeat(elem){
	var clone = elem.cloneNode(true);
	clone.dataset["tag"] = "";
	elem.parentNode.insertBefore(clone,elem);
	//if(typeof(elem.old_display)=='undefined'){
		clone.style.display = '';
	//}else{
	//	clone.style.display = elem.old_display;
	//}
	return clone;
}
/*end element operation*/

/*notification*/

/*end notification*/

/*debugging*/

/*end debugging*/

/*template related functionality*/

/*end template related functionality*/

/*display functionality*/
function display(){
	if(display_stack.length==0){
		document.body.style.display = "";
	}else{
		display_stack.shift();
	}
}
function display_wait(element_id){
	id(element_id).style.display = "none";
	set_var('#display_flag=>'+element_id,{});
}
function display_hold(target_id,this_flag){
	set_var('#display_flag=>'+target_id+'/'+this_flag,0);
}
function display_unwait(obj){
	if(typeof(obj.args.display_unwait_target)!=='undefined'&&typeof(obj.args.display_unwait_flag)!=='undefined'){
		
		var element_id = obj.args.display_unwait_target;
		var this_flag = obj.args.display_unwait_flag;
		unset_var('#display_flag=>'+element_id+'/'+this_flag);
		var decision = true;
		var flags = get_var('#display_flag=>'+element_id).value;
		for(var flag_name in flags){
			if(flags[flag_name]===0){
				decision = false;
			}
		}
		if(decision){
			id(element_id).style.display = "";
		}
		unset_var('#display_flag=>'+element_id);
	}
}
/*end display functionality*/
/*utility*/
function is_space(str){
	if(!str.replace(/\s/g, '').length){return true;}else{return false;}
}
function typeOf(value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (value instanceof Array) {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
}
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
function guid(){
	var guid =  (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
	return guid;
}
function GUID(){
	var guid =  ('_'+S4() + S4() + "_" + S4() + "_4" + S4().substr(0,3) + "_" + S4() + "_" + S4() + S4() + S4()).toLowerCase();
	return guid;
}
function getURL(){
return window.location.href.split('?')[0]
}
function getHost(){
	return window.location.origin;
}
function getURLParameterByName(name, url) {
    if (!url) url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness  
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function getURLParameters(){
	var pstr =  window.location.href.split('?')[1];
        if(typeof(pstr)=='undefined'){ return {}; }
	var parr = pstr.split('&');
	var result = {};
	for(var i=0;i<parr.length;i++){
		var kvpstr = parr[i];
		var kvp = kvpstr.split('=');
		result[kvp[0]]=kvp[1];
	}
	return result;
}
function setURLParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}
function composeURL(url,params){
	
	var new_array = [];
	for(var prop in params){
		new_array.push( prop+'='+params[prop]);
	}
	
	return url+'?'+ new_array.join('&');
}
function merge_objs(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}
function id(elem_name){
	return document.getElementById(elem_name);
}
function value(elem){

	if(elem.tagName=="DIV"){
		if(elem.innerHTML==null){			return '';		}
		return elem.innerHTML;
	}else if(elem.nodeName=="SPAN"){
		if(elem.innerHTML==null){			return '';		}
		return elem.innerHTML;
	}else{
		if(elem.value==null){			return '';		}
		return elem.value;
	}
}
function get_elem_value(elem_name){
	return value(id(elem_name));
}
function escape_cookie(string){
	var new_string = string.replace(/=/g,'&#61');
	return new_string.replace(/;/g,'&#59');
}
function unescape_cookie(string){
	var new_string = string.replace(/&#61/g,'=');
	return new_string.replace(/&#59/g,';');
}
function setCookie(cname,value){
	value = escape_cookie(value);
	//console.log(value);
	document.cookie = cname+"="+value;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return unescape_cookie(c.substring(name.length,c.length));
        }
    }
    return "";
}
function getCookies() {
	var res = {};
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
		
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
		
		var c1 = c.split('=');
		
            res[unescape_cookie(c1[0])] = unescape_cookie(c1[1]);
			
    }
    return res;
}
function deleteCookie(cname){
	document.cookie = cname + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
function decode_list(list_str){
	if(list_str!=''){
		return list_str.split(',');
	}else{
		return [];
	}
}
function encode_list(list){
	if(typeOf(list)=='object'){
		var new_list = [];
		for(var p in list){
			new_list.push(list[p]);
		}
		return new_list.join(',');
	}else{
		return list.join(',');
	}
	
}
function decode_dict(dict_str){
	var dict = {};
	var kvps = dict_str.split(';');
	for(var i=0;i<kvps.length;i++){
		var kvp = kvps[i].split(':');
		dict[kvp[0]] = kvp[1];
	}
	return dict;
}
function encode_dict(dict){
	var strs = [];
	for(var i=0;i<dict.length;i++){
		var str = dict[i][0]+':'+dict[i][1];
		strs.push(str);
	}
	return strs.join(';');
}
function insert_string(string,index,needle){
	if(index>-1&&index<=string.length){
		var head = string.substr(0,index);
		var end = string.substr(index,string.length-index);
		return head+needle+end;
	}
	return null;
}
function validateEmail(string){
	string = process_text(string);
	var re = /\S+@\S+\.\S+/igm;
	return re.test(string);
}
function validateMobile(string,length_array){
	string = string.replace(/ /g,'');
	string = string.replace(/-/g,'');
	string = string.replace(/\+/g,'');
	string = string.replace(/\*/g,'');
	string = string.replace(/#/g,'');
	if(length_array.indexOf(string.length)==-1){
		return false;
	}
	var re = /[0-9]+/igm;
	return re.test(string);
}
function process_text(string){
	string = string.replace('&nbsp;',' ');
	
	while(string.charAt(0)==' '){
		string = string.substring(1);
	}
	
	while(string.charAt(string.length-1)==' '){
		string = string.substring(0,string.length-1);
	}
	
	var index = string.indexOf(' ');
	while(index>0){
		if(string.charAt(index-1)==' '){
			string = string.substring(0,index)+string.substring(index+1,string.length);
			index = string.indexOf(' ',index); // if space is ajacent
		}else{
			index = string.indexOf(' ',index+1);
		}
	}
	
	return string;
}
/*end utility*/

/*IO*/
function upload(files,args){

    if(files.length === 0){
        return;
    }

    var data = new FormData();
    data.append('SelectedFile', files[0]);
	if(typeof(args["entity"])!="undefined"){
		//files[0].entity = args["entity"];
		data.append("entity",args["entity"]);
	}
	if(typeof(args["id"])!="undefined"){
		//files[0].id = args["id"];
		data.append("id",args["id"]);
	}
	if(typeof(args["db_format"])!="undefined"){
		//files[0].db_format = args["db_format"];
		data.append("db_format",args["db_format"]);
	}
	if(typeof(args["field"])!="undefined"){
		//files[0].db_format = args["db_format"];
		data.append("field",args["field"]);
	}

	var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if(request.readyState == 4){
            try {
                var resp = JSON.parse(request.response);
				var o = {
					args:args,
					data:resp
				};
				window[args.callback](o); // perform callback function
            } catch (e){
                var resp = {
                    status: 'error',
                    data: 'Unknown error occurred: [' + request.responseText + ']'
                };
            }
            //console.log(resp.status + ': ' + resp.data);
        }
    }; 

	if(typeof(args.progress_bar)!='undefined'){
		request.upload.addEventListener('progress', function(e){
			progress_bar.style.width = Math.ceil(e.loaded/e.total) * 100 + '%';
		}, false);
	}
   

  request.open('POST', 'lib/upload.php');
    request.send(data); 
	
}
function get_file_name(raw_name){
	var names = raw_name.split('@');
	return names[0];
}
function getHTML(who,deep){
	if(typeof(deep)=="undefined"){
		return document.getHTML(who,true);
	}else{
		return document.getHTML(who,deep);
	}
}
document.getHTML = function(who, deep){
    if(!who || !who.tagName) return '';
    var txt, ax, el= document.createElement("div");
    el.appendChild(who.cloneNode(false));
    txt= el.innerHTML;
    if(deep){
        ax= txt.indexOf('>')+1;
        txt= txt.substring(0, ax)+who.innerHTML+ txt.substring(ax);
    }
    el= null;
    return txt;
}
function clearFileInput(id){ 
    var oldInput = document.getElementById(id); 

    var newInput = document.createElement("input"); 

    newInput.type = "file"; 
    newInput.id = oldInput.id; 
    newInput.name = oldInput.name; 
    newInput.className = oldInput.className; 
    newInput.style.cssText = oldInput.style.cssText; 
    // TODO: copy any other relevant attributes 

    oldInput.parentNode.replaceChild(newInput, oldInput); 
}
/*end IO*/

/*responsive*/
function check_resize(func,this_node){
	window[func](this_node);
}
/*end responsive*/

/*Custom*/
function test_query(args){
	execute('lib/api.php','POST','test_query',args);
}
function vector2array(vec,divisor){
   var data = [];
    var row = [];
    
    for(var i=0;i<vec.length ;i++){
        row.push(vec[i]); 
        if((i%divisor==divisor-1||i==vec.length-1)){ 
            if(row.length!=0){
                data.push(JSON.stringify(row));
                row = [];
            }
        }
    }
    for(var i=0;i<data.length ;i++){
        data[i] = JSON.parse(data[i]);
    }
    return data;
}