//req JSON for cookies
window.onload = function(){
	for(var i in ez.startUp){
		ez.startUp[i]();
	}
};
var ez = {
startUp: [],
chunk:function(arr, process, context){
    setTimeout(function(){
        var item = arr.shift();
        process.call(context, item);

        if (arr.length > 0){
            setTimeout(arguments.callee, 100);
        }
    }, 100);
},
lerp:function(A,B,p){
	var p=+p<=1?+p:(parseFloat(p)/100)||0;
	return A+(B-A)*p;
},
vecToXy: function(vector,theta){
	return [Math.sin(theta)*vector,Math.cos(theta)*vector];
},
vogel: function(index,scale){
	scale=+scale||1;
	var vect = scale*Math.sqrt(index);
	var theta = index*2.3999;
	return this.vecToXy(vect,theta);
},
color:{
	list:[
	'#F7931E',
	'#0000FF',
	'#9E005D',
	'#FF0000',
	'#BADA55',
	'#662D91',
	'#FCEE21',
	'#29ABE2',
	'#FBCD3B',
	'#1B1464',
	'#603813',
	'#FF00FF',
	'#006837',
	'#C1272D',
	'#00FF00',
	'#F15A24'
	],
	hexTo:{
		'RGB':function(str){var str=str.slice(-6);return [parseInt(str.substring(0,2),16),parseInt(str.substring(2,4),16),parseInt(str.substring(4,6),16)];},
		'HSB':function(str){
			var rgb=this.RGB(str),
				min = Math.min.apply(Math,rgb),
				max = Math.max.apply(Math,rgb),
				delta = max - min,
				h, s, v = max;
				v = Math.floor(max / 255 * 100);
			if(max){s = Math.floor(delta / max * 100);}else{return [0, 0, 0];}
			if( rgb[0] == max ){
				h = (( rgb[1] - rgb[2] ) / delta)||0;         // between yellow & magenta
			}else if( rgb[1] == max ){
				h = 2 + (( rgb[2] - rgb[0] ) / delta)||0;     // between cyan & yellow
			}else{
				h = 4 + (( rgb[0] - rgb[1] ) / delta)||0;     // between magenta & cyan
			}
			h = Math.floor(h * 60);
			if( h < 0 ){ h += 360;}
			return [h, s, v];
		},'CMYK':function(str){
			var rgb=this.RGB(str),
				i=3,
				res=[1-(rgb[0]/255),1-(rgb[1]/255),1-(rgb[2]/255)];
			res[3]=Math.min.apply(Math,res);
			while(i--){
				res[i]=(res[i]-res[3])/(1-res[3]);
			}
			return res;
		}},
	hexFrom:{
		'RGB':function(arr){var res=[],i=3;while(i--){res[i]=('0'+Math.round(arr[i]).toString(16)).slice(-2);}return '#'+res.join('');},
		'HSB':function(arr){
			var r, g, b,i,f, p, q, t;s = Math.min(100, arr[1])/100||0;
			if(!s) {r *= 255;return [r,r,r];}
			h = Math.min(360, arr[0])/60||0;
			v = Math.min(100, arr[2])/100||0;
			i = ~~h;f = h - i;p = v * (1 - s);q = v * (1 - s * f);t = v * (1 - s * (1 - f));
			switch(i) {
				case 0:
					r = v;
					g = t;
					b = p;
					break;
				case 1:
					r = q;
					g = v;
					b = p;
					break;
				case 2:
					r = p;
					g = v;
					b = t;
					break;
				case 3:
					r = p;
					g = q;
					b = v;
					break;
				case 4:
					r = t;
					g = p;
					b = v;
					break;
				default: // case 5:
					r = v;
					g = p;
					b = q;
			}
			return this.RGB([r * 255,g * 255,b * 255]);},
		'CMYK':function(arr){
			var i=3,k=arr[3]*100,res=[];
			while(i--){
				//res[i]=1-Math.min(1,arr[i]*(1-k)+k);
				res[i]=((255-arr[i]*100)*(255-k))/255;
			}
			return this.RGB(res);}
	},
	lerp:function(A,B,p,sp){
		var sp=this.hexTo[sp]?sp:'RGB',
			start=this.hexTo[sp](A),
			end=this.hexTo[sp](B),
			res=[];
		if(!p){return A}
		if(p==1){return B}
		for(var i=0,ii=start.length;i<ii;i++){
			res.push(ez.lerp(start[i],end[i],p));
		}
		return this.hexFrom[sp](res);
	}
},
ipToInt:function(A,B,C,D){
	if(!B&&A){
		var arg=A.split('.'),
			A=parseInt(arg[0]),
			B=parseInt(arg[1]),
			C=parseInt(arg[2]),
			D=parseInt(arg[3]);
	}
	return  (A*16777216)+(B*65536)+(C*256)+D;
},
Integrator:function(init,target,damping,attraction){
	this.value = init;
	this.vel=0;
	this.accel=0;
	this.force=0;
	this.mass = 1;
	this.damping = +damping||0.5;
	this.attraction = +attraction||0.2;
	this.target=isFinite(target)?target:0;
	this.set=function(val){
		this.value=val;
	}
	this.update=function(){
		this.force += this.attraction * (this.target - this.value);
		this.accel = this.force / this.mass;
		this.vel = (this.vel + this.accel) * this.damping;
		this.force = 0;
		return this.value += this.vel;
	}
	this.setTarget=function(t) {
		this.target = t;
	}
},
isIE:(navigator.appName=='Microsoft Internet Explorer') || false,
getData:function(){
	var sGet = window.location.search.substr(1);
	if (sGet){
		// Generate a string array of the name value pairs.
		// Each array element will have the form "foo=bar"
		var sNVPairs = sGet.split("&");
		
		// Now, for each name-value pair, we need to extract
		// the name and value.
		var i=0,ii=sNVPairs.length,_GET=[],sNV,nm;
		for (; i < ii; i++){
			sNV = sNVPairs[i].split("=");
			if(sNV[0].substr(-2,2)=='[]'){
				nm=sNV[0].slice(0,-2);
				_GET[nm]?_GET[nm].push(sNV[1]):_GET[nm]=[sNV[1]];
			}else{
				_GET[sNV[0]] = sNV[1];
			}
		}
		return _GET;
	}
	return false;
},
formatNum:function(num){
	var n=num.toString().split('.'),
		str=n[1]?'.'+n[1]:'';
	for(var i=n[0].length;n[0].charAt(i-4)>0 || n[0].charAt(i-4)==='0';i-=3){
		str=','+n[0].substring(i-3,i)+str;
	}
	str=n[0].substring(0,i)+str;
	return str;
},
mouse:{x:'',y:''},
getId:function(arg){return document.getElementById(arg);},
make:function(type,style,attr,child){
	var el=document.createElement(type);
	for(var i in style){
		el.style[i]=style[i];
	}
	for(var i in attr){
		el[i]=attr[i];
	}
	if(child){
		for(var i=0,l=child.length;i<l;i+=1){
			el.appendChild(child[i]);
		}
	}
	return el;
},
requestURL: function(url,reqType,callback,send,opts){
	if (window.XMLHttpRequest) {
		var request = new XMLHttpRequest();
	} else if(window.ActiveXObject){
		try{
			var request = new ActiveXobject('Msxml2.XMLHTTP');
		} catch(otherMS){
			try{
				var request = new ActiveXObject('Microsoft.XMLHTTP');
			} catch(failed){
				var request = 'Uh oh, I\'m having trouble with your browser.';
				callback(request);
				return request;
			}
		}
	}
	if(!opts){opts={};}
	if(!reqType){var reqType = 'GET';}
	request.open(reqType,url,true);
	request.setRequestHeader("Content-type",opts.contentType||"application/x-www-form-urlencoded");
	request.onreadystatechange = function(){ez.requestReady(request,callback)};
	request.send(send);
	return request;
},
requestReady: function(request,callback){
	if (request.readyState == 4){
		if (request.status == 200){
			callback(request);
		} else {
			callback('Waz? I\'m having trouble talking to the database right now. Please try again soon.')
		}
	}
},
nsResolver: function(sPrefix){
	switch(sPrefix){
		case 'content':
			return 'http://purl.org/rss/1.0/modules/content/';
			break;
		default:
			return null;
			break;
	}
},
IEnsResolver: 'xmlns:content="http://purl.org/rss/1.0/modules/content/"',
xpath: function(XMLdoc,xpathExp){
	if(window.ActiveXObject){
		ez.xpath = function(XMLdoc,xpathExp){
			XMLdoc.setProperty('SelectionLanguage','XPath');
			XMLdoc.setProperty('SelectionNamespaces',ez.IEnsResolver);
			var resultObj = XMLdoc.selectNodes(xpathExp);
			var result = new Array();
			for (var i=0; i<resultObj.length; i++){
				result.push(resultObj.item(i).text);
			}
			return result;
		}
	} else if((document.implementation)&&(document.implementation.createDocument)){
		ez.xpath = function(XMLdoc,xpathExp){
			var resultObj = XMLdoc.evaluate(xpathExp, XMLdoc, ez.nsResolver, XPathResult.ANY_TYPE,null);
			var curItem = resultObj.iterateNext();
			var result = new Array();
			while (curItem){
				result.push(curItem.textContent);
				curItem = resultObj.iterateNext();
			}
			return result;
		}
	} else {
		return null;
	}
	return ez.xpath(XMLdoc,xpathExp);
},
addEvent: function(obj, evType, fn, useCapture){
  if (obj.addEventListener){
    obj.addEventListener(evType, fn, useCapture);
    return true;
  } else if (obj.attachEvent){
    var r = obj.attachEvent("on"+evType, fn);
    return r;
  } else {
    alert("Handler could not be attached");
  }
},
removeEvent: function(obj, evType, fn, useCapture){
  if (obj.removeEventListener){
    obj.removeEventListener(evType, fn, useCapture);
    return true;
  } else if (obj.detachEvent){
    var r = obj.detachEvent("on"+evType, fn);
    return r;
  } else {
    alert("Handler could not be removed");
  }
},
addClass: function(newClass){ //add any number of elements or arrays of elements as additional arguments
	ElementsCycle:
	for(var i=1; i<arguments.length; i++){
		if(arguments[i]&&arguments[i].className){
			var curClass = arguments[i].className.split(' ');
			for(var j in curClass){
				//check to make sure class isnt already present
				if(curClass[j] == newClass){
					continue ElementsCycle;
				}
			}
		}else if(arguments[i]){
			arguments[i].className='';
		}
		if(arguments[i]){arguments[i].className += ' ' + newClass;}
	}
},
removeClass: function(oldClass){ //add any number of elements as additional arguments
	var myRegEx = new RegExp('(\\s?\\b' + oldClass + '\\b\\s?\\s?)|(\\s?\\s?\\b' + oldClass + '\\b\\s?)','gi');
	for(var i=1; i<arguments.length; i++){
		if(arguments[i]&&arguments[i].className){
			arguments[i].className = arguments[i].className.replace(myRegEx,'');
		}
	}
},
addScript: function(filename,callback){
	if(filename.slice(-4)=='.css'){
		var fileref=document.createElement('link');
		fileref.rel = 'stylesheet';
		fileref.type = 'text/css';
		fileref.href = filename;
	}else if(filename.slice(-3)=='.js'){
		var fileref=document.createElement('script');
		fileref.type = 'text/javascript';
		fileref.language = 'javascript';
		fileref.src = filename;
		if(callback){
			fileref.onloadDone=false;//for Opera
			fileref.onload=function(){fileref.onloadDone=true;callback();};
			fileref.onReadystatechange=function(){
				if(fileref.readyState==='loaded'&& !fileref.onloadDone){
					fileref.onloadDone=true;callback();
				}
			}
		}
	}else{
		return false;
	}
	if(typeof(fileref)!=='undefined'){
		document.getElementsByTagName('head')[0].appendChild(fileref);
	}
},
skew: function(val,factor,max,min){
	if(parseFloat(val)<0){val=0;}
	if(!parseFloat(factor)){var factor = 0;}
	if(!parseFloat(min)){var min = 0;}
	if(!parseFloat(max)){var max = 100;}
	var max = max - min;
	var val = val - min;
	var newVal = Math.round(((Math.pow(val,Math.pow(2,factor)))/(Math.pow(max,Math.pow(2,factor)-1)))+min);
	if(newVal.toString()=='NaN'){newVal = 0;}
	return newVal;
},
warp: function(val,factor,max,min,node){//node is % position of s-curve node on undistorted distribution, factor is 1st factor (float) or array of 1st & 2nd
	if(!parseFloat(node)){var node = 0.5;}
	if(!parseFloat(max)){var max = 100;}
	if(!parseFloat(min)){var min = 0;}
	if(typeof(factor)==='number'){
		var factor = [factor,-factor];
	} else {
		if(!typeof(factor[0])=='number'){factor[0] = 0;}
		if(!typeof(factor[1])=='number'){factor[1] = 0;}
	}
	var nodepoint = (((max-min)*node)+min);
	if(val<nodepoint){
		return ez.skew(val,factor[0],nodepoint,min);
	} else {
		return ez.skew(val,factor[1],max,nodepoint);
	}
},
serialDate: function(serial){
	return new Date(new Date('12/30/1899').valueOf() + (serial*86400000));
},
keyhook: {
	start:function(standard){
		if(standard){
			this.standard=standard;
		}
		document.onkeydown = function(e){
			e = window.event || e;
			var num = e.keyCode||0;
			if(ez.keyhook.keys[num]){
				return ez.keyhook.keys[num]();
			} else {
				return ez.keyhook.standard(num);
			}
		}
	},
	stop:function(){
		document.onkeydown = function(e){};
	},
	keys:[],
	standard:function(num){}
},
cookie:function(name,val,param){
	var param=param||{};
	if(typeof(val)!='string'&&JSON){val=JSON.stringify(val);}
	if(!name||!val){return false;}
	var edate=new Date();
	edate.setSeconds(edate.getSeconds()+(param['exp']||31536000));//1 year from now
	this.name=name;
	this.val=val.replace(/;/g,'semic');
	this.dom=param['dom']||window.location.hostname;
	this.path=param['path']||'';
	this.exp=edate.toGMTString();
	this.bake=function(){
		try{
			document.cookie=this.name+'='+this.val+'; expires='+this.exp+'; path='+this.path+'; domain='+this.dom;
		}catch(e){
			return false;
		}
		if(ez.getCookie(this.name)){
			return this;
		}
		return false;
	};
	this.crumble=function(){
		return ez.delCookie(this.name);
	};
	this.monster='Nam Nam Nam!';
},
getCookie:function(name){
	var tmp=document.cookie.split(';');
	if(!tmp[0][0]){return false;}
	var tmp2=[];
	var cookies={};
	for(var i=0,ii=tmp.length;i<ii;i+=1){
		var eq=tmp[i].indexOf('=');
		tmp2[0]=tmp[i].slice(0,eq);
		tmp2[1]=tmp[i].slice(eq+1);
		tmp2[1]=tmp2[1].replace(/semic/g,';');
		try{
			tmp2[1]=JSON.parse(tmp2[1]);
		}catch(e){}
		cookies[tmp2[0].replace(/^\s+|\s+$/g,'')]=tmp2[1];
	}
	if(name){
		return cookies[name]||false;
	};
	return cookies;
},
delCookie:function(name){
	if(name&&ez.getCookie(name)){
		return (new ez.cookie(name,'foo',{exp:1}).bake());
	}
	return false;
}
}
//Stay Classy San Diego...
document.getElementsByClassName = function(strClass, strTag, objContElm){
  strTag = strTag || "*";
  objContElm = objContElm || document;
  var objColl = objContElm.getElementsByTagName(strTag);
  if (!objColl.length &&  strTag == "*" &&  objContElm.all) objColl = objContElm.all;
  var arr = new Array();
  var delim = strClass.indexOf('|') != -1  ? '|' : ' ';
  var arrClass = strClass.split(delim);
  for (var i = 0, j = objColl.length; i < j; i++) {
    var arrObjClass = objColl[i].className.split(' ');
    if (delim == ' ' && arrClass.length > arrObjClass.length) continue;
    var c = 0;
    comparisonLoop:
    for (var k = 0, l = arrObjClass.length; k < l; k++) {
      for (var m = 0, n = arrClass.length; m < n; m++) {
        if (arrClass[m] == arrObjClass[k]) c++;
        if (( delim == '|' && c == 1) || (delim == ' ' && c == arrClass.length)) {
          arr.push(objColl[i]);
          break comparisonLoop;
        }
      }
    }
  }
  return arr;
};
//give IE standard array.indexOf method
if(!Array.indexOf){
  Array.prototype.indexOf = function(obj){
   for(var i=0; i<this.length; i++){
    if(this[i]==obj){
     return i;
    }
   }
   return -1;
  };
}
//initialize Mouse vars
