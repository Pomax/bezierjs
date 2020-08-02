/*!
 * bezier-js - v2.6.1
 * Compiled Sun, 02 Aug 2020 15:08:25 UTC
 *
 * bezier-js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
var Bezier=function(t){"use strict";function r(t){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}function n(t,r){for(var e=0;e<r.length;e++){var n=r[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function i(t,r,e){return r&&n(t.prototype,r),e&&n(t,e),t}function o(t,r,e){return r in t?Object.defineProperty(t,r,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[r]=e,t}var a=Math.abs,u=Math.cos,s=Math.sin,f=Math.acos,c=Math.atan2,l=Math.sqrt,h=Math.pow,y=function(t){return t<0?-h(-t,1/3):h(t,1/3)},x=Math.PI,v=2*x,p=x/2,m=Number.MAX_SAFE_INTEGER||9007199254740991,d=Number.MIN_SAFE_INTEGER||-9007199254740991,z={x:0,y:0,z:0},g={Tvalues:[-.06405689286260563,.06405689286260563,-.1911188674736163,.1911188674736163,-.3150426796961634,.3150426796961634,-.4337935076260451,.4337935076260451,-.5454214713888396,.5454214713888396,-.6480936519369755,.6480936519369755,-.7401241915785544,.7401241915785544,-.820001985973903,.820001985973903,-.8864155270044011,.8864155270044011,-.9382745520027328,.9382745520027328,-.9747285559713095,.9747285559713095,-.9951872199970213,.9951872199970213],Cvalues:[.12793819534675216,.12793819534675216,.1258374563468283,.1258374563468283,.12167047292780339,.12167047292780339,.1155056680537256,.1155056680537256,.10744427011596563,.10744427011596563,.09761865210411388,.09761865210411388,.08619016153195327,.08619016153195327,.0733464814110803,.0733464814110803,.05929858491543678,.05929858491543678,.04427743881741981,.04427743881741981,.028531388628933663,.028531388628933663,.0123412297999872,.0123412297999872],arcfn:function(t,r){var e=r(t),n=e.x*e.x+e.y*e.y;return void 0!==e.z&&(n+=e.z*e.z),l(n)},compute:function(t,r,e){if(0===t)return r[0];var n=r.length-1;if(1===t)return r[n];var i=r,o=1-t;if(0===n)return r[0];if(1===n){var a={x:o*i[0].x+t*i[1].x,y:o*i[0].y+t*i[1].y};return e&&(a.z=o*i[0].z+t*i[1].z),a}if(n<4){var u,s,f,c=o*o,l=t*t,h=0;2===n?(i=[i[0],i[1],i[2],z],u=c,s=o*t*2,f=l):3===n&&(u=c*o,s=c*t*3,f=o*l*3,h=t*l);var y={x:u*i[0].x+s*i[1].x+f*i[2].x+h*i[3].x,y:u*i[0].y+s*i[1].y+f*i[2].y+h*i[3].y};return e&&(y.z=u*i[0].z+s*i[1].z+f*i[2].z+h*i[3].z),y}for(var x=JSON.parse(JSON.stringify(r));x.length>1;){for(var v=0;v<x.length-1;v++)x[v]={x:x[v].x+(x[v+1].x-x[v].x)*t,y:x[v].y+(x[v+1].y-x[v].y)*t},void 0!==x[v].z&&(x[v]=x[v].z+(x[v+1].z-x[v].z)*t);x.splice(x.length-1,1)}return x[0]},computeWithRatios:function(t,r,e,n){var i,o=1-t,a=e,u=r,s=a[0],f=a[1],c=a[2],l=a[3];return s*=o,f*=t,2===u.length?(i=s+f,{x:(s*u[0].x+f*u[1].x)/i,y:(s*u[0].y+f*u[1].y)/i,z:!!n&&(s*u[0].z+f*u[1].z)/i}):(s*=o,f*=2*o,c*=t*t,3===u.length?(i=s+f+c,{x:(s*u[0].x+f*u[1].x+c*u[2].x)/i,y:(s*u[0].y+f*u[1].y+c*u[2].y)/i,z:!!n&&(s*u[0].z+f*u[1].z+c*u[2].z)/i}):(s*=o,f*=1.5*o,c*=3*o,l*=t*t*t,4===u.length?(i=s+f+c+l,{x:(s*u[0].x+f*u[1].x+c*u[2].x+l*u[3].x)/i,y:(s*u[0].y+f*u[1].y+c*u[2].y+l*u[3].y)/i,z:!!n&&(s*u[0].z+f*u[1].z+c*u[2].z+l*u[3].z)/i}):void 0))},derive:function(t,r){for(var e=[],n=t,i=n.length,o=i-1;i>1;i--,o--){for(var a=new Array(o),u=0;u<o;u++){var s={x:o*(n[u+1].x-n[u].x),y:o*(n[u+1].y-n[u].y)};r&&(s.z=o*(n[u+1].z-n[u].z)),a[u]=s}e.push(a),n=a}return e},between:function(t,r,e){return r<=t&&t<=e||g.approximately(t,r)||g.approximately(t,e)},approximately:function(t,r,e){return a(t-r)<=(e||1e-6)},length:function(t){var r,e,n=0,i=g.Tvalues.length;for(r=0;r<i;r++)e=.5*g.Tvalues[r]+.5,n+=g.Cvalues[r]*g.arcfn(e,t);return.5*n},map:function(t,r,e,n,i){return n+(i-n)*((t-r)/(e-r))},lerp:function(t,r,e){var n={x:r.x+t*(e.x-r.x),y:r.y+t*(e.y-r.y)};return r.z&&e.z&&(n.z=r.z+t*(e.z-r.z)),n},pointToString:function(t){var r=t.x+"/"+t.y;return void 0!==t.z&&(r+="/"+t.z),r},pointsToString:function(t){return"["+t.map(g.pointToString).join(", ")+"]"},copy:function(t){return JSON.parse(JSON.stringify(t))},angle:function(t,r,e){var n=r.x-t.x,i=r.y-t.y,o=e.x-t.x,a=e.y-t.y;return c(n*a-i*o,n*o+i*a)},round:function(t,r){var e=""+t,n=e.indexOf(".");return parseFloat(e.substring(0,n+1+r))},dist:function(t,r){var e=t.x-r.x,n=t.y-r.y;return l(e*e+n*n)},closest:function(t,r){var e,n,i=h(2,63);return t.forEach((function(t,o){(n=g.dist(r,t))<i&&(i=n,e=o)})),{mdist:i,mpos:e}},abcratio:function(t,r){if(2!==r&&3!==r)return!1;if(void 0===t)t=.5;else if(0===t||1===t)return t;var e=h(t,r)+h(1-t,r);return a((e-1)/e)},projectionratio:function(t,r){if(2!==r&&3!==r)return!1;if(void 0===t)t=.5;else if(0===t||1===t)return t;var e=h(1-t,r);return e/(h(t,r)+e)},lli8:function(t,r,e,n,i,o,a,u){var s=(t-e)*(o-u)-(r-n)*(i-a);return 0!==s&&{x:((t*n-r*e)*(i-a)-(t-e)*(i*u-o*a))/s,y:((t*n-r*e)*(o-u)-(r-n)*(i*u-o*a))/s}},lli4:function(t,r,e,n){return g.lli8(t.x,t.y,r.x,r.y,e.x,e.y,n.x,n.y)},lli:function(t,r){return g.lli4(t,t.c,r,r.c)},makeline:function(t,r){var e=t.x,n=t.y,i=r.x,o=r.y,a=(i-e)/3,u=(o-n)/3;return new I(e,n,e+a,n+u,e+2*a,n+2*u,i,o)},findbbox:function(t){var r=m,e=m,n=d,i=d;return t.forEach((function(t){var o=t.bbox();r>o.x.min&&(r=o.x.min),e>o.y.min&&(e=o.y.min),n<o.x.max&&(n=o.x.max),i<o.y.max&&(i=o.y.max)})),{x:{min:r,mid:(r+n)/2,max:n,size:n-r},y:{min:e,mid:(e+i)/2,max:i,size:i-e}}},shapeintersections:function(t,r,e,n,i){if(!g.bboxoverlap(r,n))return[];var o=[],a=[t.startcap,t.forward,t.back,t.endcap],u=[e.startcap,e.forward,e.back,e.endcap];return a.forEach((function(r){r.virtual||u.forEach((function(n){if(!n.virtual){var a=r.intersects(n,i);a.length>0&&(a.c1=r,a.c2=n,a.s1=t,a.s2=e,o.push(a))}}))})),o},makeshape:function(t,r,e){var n=r.points.length,i=t.points.length,o=g.makeline(r.points[n-1],t.points[0]),a=g.makeline(t.points[i-1],r.points[0]),u={startcap:o,forward:t,back:r,endcap:a,bbox:g.findbbox([o,t,r,a])},s=g;return u.intersections=function(t){return s.shapeintersections(u,u.bbox,t,t.bbox,e)},u},getminmax:function(t,r,e){if(!e)return{min:0,max:0};var n,i,o=m,a=d;-1===e.indexOf(0)&&(e=[0].concat(e)),-1===e.indexOf(1)&&e.push(1);for(var u=0,s=e.length;u<s;u++)n=e[u],(i=t.get(n))[r]<o&&(o=i[r]),i[r]>a&&(a=i[r]);return{min:o,mid:(o+a)/2,max:a,size:a-o}},align:function(t,r){var e=r.p1.x,n=r.p1.y,i=-c(r.p2.y-n,r.p2.x-e);return t.map((function(t){return{x:(t.x-e)*u(i)-(t.y-n)*s(i),y:(t.x-e)*s(i)+(t.y-n)*u(i)}}))},roots:function(t,r){r=r||{p1:{x:0,y:0},p2:{x:1,y:0}};var e=t.length-1,n=g.align(t,r),i=function(t){return t>=0&&t<=1};if(2===e){var o=n[0].y,a=n[1].y,s=n[2].y,c=o-2*a+s;if(0!==c){var h=-l(a*a-o*s),x=-o+a;return[-(h+x)/c,-(-h+x)/c].filter(i)}return a!==s&&0===c?[(2*a-s)/(2*a-2*s)].filter(i):[]}var p=n[0].y,m=n[1].y,d=n[2].y,z=3*m-p-3*d+n[3].y,b=3*p-6*m+3*d,_=-3*p+3*m,k=p;if(g.approximately(z,0)){if(g.approximately(b,0))return g.approximately(_,0)?[]:[-k/_].filter(i);var w=l(_*_-4*b*k),E=2*b;return[(w-_)/E,(-_-w)/E].filter(i)}var S,M=(n=(3*(_/=z)-(b/=z)*b)/3)/3,j=(w=(2*b*b*b-9*b*_+27*(k/=z))/27)/2,O=j*j+M*M*M;if(O<0){var T=-n/3,C=l(T*T*T),B=-w/(2*C),L=f(B<-1?-1:B>1?1:B),A=2*y(C);return[A*u(L/3)-b/3,A*u((L+v)/3)-b/3,A*u((L+2*v)/3)-b/3].filter(i)}if(0===O)return[2*(S=j<0?y(-j):-y(j))-b/3,-S-b/3].filter(i);var N=l(O);return[(S=y(-j+N))-y(j+N)-b/3].filter(i)},droots:function(t){if(3===t.length){var r=t[0],e=t[1],n=t[2],i=r-2*e+n;if(0!==i){var o=-l(e*e-r*n),a=-r+e;return[-(o+a)/i,-(-o+a)/i]}return e!==n&&0===i?[(2*e-n)/(2*(e-n))]:[]}if(2===t.length){var u=t[0],s=t[1];return u!==s?[u/(u-s)]:[]}},curvature:function(t,r,e,n){var i,o,u,s,f,c,y=g.derive(r),x=y[0],v=y[1],p=g.compute(t,x),m=g.compute(t,v),d=p.x*p.x+p.y*p.y;if(e?(i=l(h(p.y*m.z-m.y*p.z,2)+h(p.z*m.x-m.z*p.x,2)+h(p.x*m.y-m.x*p.y,2)),o=h(d+p.z*p.z,1.5)):(i=p.x*m.y-p.y*m.x,o=h(d,1.5)),0===i||0===o)return{k:0,r:0};if(f=i/o,c=o/i,!n){var z=g.curvature(t-.001,r,e,!0).k,b=g.curvature(t+.001,r,e,!0).k;s=(b-f+(f-z))/2,u=(a(b-f)+a(f-z))/2}return{k:f,r:c,dk:s,adk:u}},inflections:function(t){if(t.length<4)return[];var r=g.align(t,{p1:t[0],p2:t.slice(-1)[0]}),e=r[2].x*r[1].y,n=r[3].x*r[1].y,i=r[1].x*r[2].y,o=r[3].x*r[2].y,a=18*(-3*e+2*n+3*i-o),u=18*(3*e-n-3*i),s=18*(i-e);if(g.approximately(a,0)){if(!g.approximately(u,0)){var f=-s/u;if(f>=0&&f<=1)return[f]}return[]}var c=u*u-4*a*s,l=Math.sqrt(c);return o=2*a,g.approximately(o,0)?[]:[(l-u)/o,-(u+l)/o].filter((function(t){return t>=0&&t<=1}))},bboxoverlap:function(t,r){var e,n,i,o,u,s=["x","y"],f=s.length;for(e=0;e<f;e++)if(i=t[n=s[e]].mid,o=r[n].mid,u=(t[n].size+r[n].size)/2,a(i-o)>=u)return!1;return!0},expandbox:function(t,r){r.x.min<t.x.min&&(t.x.min=r.x.min),r.y.min<t.y.min&&(t.y.min=r.y.min),r.z&&r.z.min<t.z.min&&(t.z.min=r.z.min),r.x.max>t.x.max&&(t.x.max=r.x.max),r.y.max>t.y.max&&(t.y.max=r.y.max),r.z&&r.z.max>t.z.max&&(t.z.max=r.z.max),t.x.mid=(t.x.min+t.x.max)/2,t.y.mid=(t.y.min+t.y.max)/2,t.z&&(t.z.mid=(t.z.min+t.z.max)/2),t.x.size=t.x.max-t.x.min,t.y.size=t.y.max-t.y.min,t.z&&(t.z.size=t.z.max-t.z.min)},pairiteration:function(t,r,e){var n=t.bbox(),i=r.bbox(),o=1e5,a=e||.5;if(n.x.size+n.y.size<a&&i.x.size+i.y.size<a)return[(o*(t._t1+t._t2)/2|0)/o+"/"+(o*(r._t1+r._t2)/2|0)/o];var u=t.split(.5),s=r.split(.5),f=[{left:u.left,right:s.left},{left:u.left,right:s.right},{left:u.right,right:s.right},{left:u.right,right:s.left}];f=f.filter((function(t){return g.bboxoverlap(t.left.bbox(),t.right.bbox())}));var c=[];return 0===f.length?c:(f.forEach((function(t){c=c.concat(g.pairiteration(t.left,t.right,a))})),c=c.filter((function(t,r){return c.indexOf(t)===r})))},getccenter:function(t,r,e){var n,i=r.x-t.x,o=r.y-t.y,a=e.x-r.x,f=e.y-r.y,l=i*u(p)-o*s(p),h=i*s(p)+o*u(p),y=a*u(p)-f*s(p),x=a*s(p)+f*u(p),m=(t.x+r.x)/2,d=(t.y+r.y)/2,z=(r.x+e.x)/2,b=(r.y+e.y)/2,_=m+l,k=d+h,w=z+y,E=b+x,S=g.lli8(m,d,_,k,z,b,w,E),M=g.dist(S,t),j=c(t.y-S.y,t.x-S.x),O=c(r.y-S.y,r.x-S.x),T=c(e.y-S.y,e.x-S.x);return j<T?((j>O||O>T)&&(j+=v),j>T&&(n=T,T=j,j=n)):T<O&&O<j?(n=T,T=j,j=n):T+=v,S.s=j,S.e=T,S.r=M,S},numberSort:function(t,r){return t-r}},b=function(){function t(r){e(this,t),this.curves=[],this._3d=!1,r&&(this.curves=r,this._3d=this.curves[0]._3d)}return i(t,[{key:"valueOf",value:function(){return this.toString()}},{key:"toString",value:function(){return"["+this.curves.map((function(t){return g.pointsToString(t.points)})).join(", ")+"]"}},{key:"addCurve",value:function(t){this.curves.push(t),this._3d=this._3d||t._3d}},{key:"length",value:function(){return this.curves.map((function(t){return t.length()})).reduce((function(t,r){return t+r}))}},{key:"curve",value:function(t){return this.curves[t]}},{key:"bbox",value:function(){for(var t=this.curves,r=t[0].bbox(),e=1;e<t.length;e++)g.expandbox(r,t[e].bbox());return r}},{key:"offset",value:function(r){var e=[];return this.curves.forEach((function(t){e=e.concat(t.offset(r))})),new t(e)}}]),t}();var _={x:!1,y:!1};function k(t,r,e){if("Z"!==r){if("M"!==r){var n=[!1,_.x,_.y].concat(e),i=new(t.bind.apply(t,n)),o=e.slice(-2);return _={x:o[0],y:o[1]},i}_={x:e[0],y:e[1]}}}function w(t,r){for(var e,n,i=function(t){var r,e,n,i,o,a,u=(t=t.replace(/,/g," ").replace(/-/g," - ").replace(/-\s+/g,"-").replace(/([a-zA-Z])/g," $1 ")).replace(/([a-zA-Z])\s?/g,"|$1").split("|"),s=u.length,f=[],c=0,l=0,h=0,y=0,x=0,v=0,p=0,m=0,d="";for(r=1;r<s;r++)if(i=(n=(e=u[r]).substring(0,1)).toLowerCase(),o=(f=(f=e.replace(n,"").trim().split(" ")).filter((function(t){return""!==t})).map(parseFloat)).length,"m"===i){if(d+="M ","m"===n?(h+=f[0],y+=f[1]):(h=f[0],y=f[1]),c=h,l=y,d+=h+" "+y+" ",o>2)for(a=0;a<o;a+=2)"m"===n?(h+=f[a],y+=f[a+1]):(h=f[a],y=f[a+1]),d+=["L",h,y,""].join(" ")}else if("l"===i)for(a=0;a<o;a+=2)"l"===n?(h+=f[a],y+=f[a+1]):(h=f[a],y=f[a+1]),d+=["L",h,y,""].join(" ");else if("h"===i)for(a=0;a<o;a++)"h"===n?h+=f[a]:h=f[a],d+=["L",h,y,""].join(" ");else if("v"===i)for(a=0;a<o;a++)"v"===n?y+=f[a]:y=f[a],d+=["L",h,y,""].join(" ");else if("q"===i)for(a=0;a<o;a+=4)"q"===n?(x=h+f[a],v=y+f[a+1],h+=f[a+2],y+=f[a+3]):(x=f[a],v=f[a+1],h=f[a+2],y=f[a+3]),d+=["Q",x,v,h,y,""].join(" ");else if("t"===i)for(a=0;a<o;a+=2)x=h+(h-x),v=y+(y-v),"t"===n?(h+=f[a],y+=f[a+1]):(h=f[a],y=f[a+1]),d+=["Q",x,v,h,y,""].join(" ");else if("c"===i)for(a=0;a<o;a+=6)"c"===n?(x=h+f[a],v=y+f[a+1],p=h+f[a+2],m=y+f[a+3],h+=f[a+4],y+=f[a+5]):(x=f[a],v=f[a+1],p=f[a+2],m=f[a+3],h=f[a+4],y=f[a+5]),d+=["C",x,v,p,m,h,y,""].join(" ");else if("s"===i)for(a=0;a<o;a+=4)x=h+(h-p),v=y+(y-m),"s"===n?(p=h+f[a],m=y+f[a+1],h+=f[a+2],y+=f[a+3]):(p=f[a],m=f[a+1],h=f[a+2],y=f[a+3]),d+=["C",x,v,p,m,h,y,""].join(" ");else"z"===i&&(d+="Z ",h=c,y=l);return d.trim()}(r).split(" "),o=new RegExp("[MLCQZ]",""),a=[],u={C:6,Q:4,L:2,M:2};i.length;)e=i.splice(0,1)[0],o.test(e)&&(n=k(t,e,i.splice(0,u[e]).map(parseFloat)))&&a.push(n);return new t.PolyBezier(a)}var E=Math.abs,S=Math.min,M=Math.max,j=Math.cos,O=Math.sin,T=Math.acos,C=Math.sqrt,B=Math.PI,L={x:0,y:0,z:0},A=["x","y","z"];function N(t,r,e,n,i){void 0===i&&(i=.5);var o=g.projectionratio(i,t),a=1-o,u={x:o*r.x+a*n.x,y:o*r.y+a*n.y},s=g.abcratio(i,t);return{A:{x:e.x+(e.x-u.x)/s,y:e.y+(e.y-u.y)/s},B:e,C:u}}var I=function(){function t(n){var i=this;e(this,t),o(this,"derivative",(function(t){var r,e,n=1-t,o=0,a=i.dpoints[0];2===i.order&&(a=[a[0],a[1],L],r=n,e=t),3===i.order&&(r=n*n,e=n*t*2,o=t*t);var u={x:r*a[0].x+e*a[1].x+o*a[2].x,y:r*a[0].y+e*a[1].y+o*a[2].y};return i._3d&&(u.z=r*a[0].z+e*a[1].z+o*a[2].z),u}));var a=n&&n.forEach?n:[].slice.call(arguments),u=!1;if("object"===r(a[0])){u=a.length;var s=[];a.forEach((function(t){A.forEach((function(r){void 0!==t[r]&&s.push(t[r])}))})),a=s}var f=!1,c=a.length;if(u){if(u>4){if(1!==arguments.length)throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");f=!0}}else if(6!==c&&8!==c&&9!==c&&12!==c&&1!==arguments.length)throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");var l=!f&&(9===c||12===c)||n&&n[0]&&void 0!==n[0].z;this._3d=l;for(var h=[],y=0,x=l?3:2;y<c;y+=x){var v={x:a[y],y:a[y+1]};l&&(v.z=a[y+2]),h.push(v)}this.order=h.length-1,this.points=h;var p=["x","y"];l&&p.push("z"),this.dims=p,this.dimlen=p.length,function(t){for(var r=t.order,e=t.points,n=g.align(e,{p1:e[0],p2:e[r]}),i=0;i<n.length;i++)if(E(n[i].y)>1e-4)return void(t._linear=!1);t._linear=!0}(this),this._t1=0,this._t2=1,this.update()}return i(t,[{key:"point",value:function(t){return this.points[t]}},{key:"get",value:function(t){return this.compute(t)}},{key:"compute",value:function(t){return this.ratios?g.computeWithRatios(t,this.points,this.ratios,this._3d):g.compute(t,this.points,this._3d,this.ratios)}},{key:"setRatios",value:function(t){if(t.length!==this.points.length)throw new Error("Incorrect number of ratio values");this.ratios=t,this._lut=[]}},{key:"getLUT",value:function(t){if(this.verify(),t=t||100,this._lut.length===t)return this._lut;this._lut=[],t--;for(var r=0;r<=t;r++)this._lut.push(this.compute(r/t));return this._lut}},{key:"on",value:function(t,r){r=r||5;for(var e,n=this.getLUT(),i=[],o=0,a=0;a<n.length;a++)e=n[a],g.dist(e,t)<r&&(i.push(e),o+=a/n.length);return!!i.length&&o/i.length}},{key:"project",value:function(t){var r,e,n,i,o=this.getLUT(),a=o.length-1,u=g.closest(o,t),s=u.mdist,f=u.mpos,c=(f+1)/a,l=.1/a;for(s+=1,r=e=(f-1)/a;e<c+l;e+=l)n=this.compute(e),(i=g.dist(t,n))<s&&(s=i,r=e);return(n=this.compute(r)).t=r,n.d=s,n}},{key:"raise",value:function(){for(var r,e,n=this.points,i=[n[0]],o=n.length,a=1;a<o;a++)r=n[a],e=n[a-1],i[a]={x:(o-a)/o*r.x+a/o*e.x,y:(o-a)/o*r.y+a/o*e.y};return i[o]=n[o-1],new t(i)}},{key:"length",value:function(){return g.length(this.derivative.bind(this))}},{key:"curvature",value:function(t){return g.curvature(t,this.points,this._3d)}},{key:"inflections",value:function(){return g.inflections(this.points)}},{key:"normal",value:function(t){return this._3d?this.__normal3(t):this.__normal2(t)}},{key:"__normal2",value:function(t){var r=this.derivative(t),e=C(r.x*r.x+r.y*r.y);return{x:-r.y/e,y:r.x/e}}},{key:"__normal3",value:function(t){var r=this.derivative(t),e=this.derivative(t+.01),n=C(r.x*r.x+r.y*r.y+r.z*r.z),i=C(e.x*e.x+e.y*e.y+e.z*e.z);r.x/=n,r.y/=n,r.z/=n,e.x/=i,e.y/=i,e.z/=i;var o={x:e.y*r.z-e.z*r.y,y:e.z*r.x-e.x*r.z,z:e.x*r.y-e.y*r.x},a=C(o.x*o.x+o.y*o.y+o.z*o.z);o.x/=a,o.y/=a,o.z/=a;var u=[o.x*o.x,o.x*o.y-o.z,o.x*o.z+o.y,o.x*o.y+o.z,o.y*o.y,o.y*o.z-o.x,o.x*o.z-o.y,o.y*o.z+o.x,o.z*o.z];return{x:u[0]*r.x+u[1]*r.y+u[2]*r.z,y:u[3]*r.x+u[4]*r.y+u[5]*r.z,z:u[6]*r.x+u[7]*r.y+u[8]*r.z}}},{key:"hull",value:function(t){var r,e=this.points,n=[],i=[],o=0,a=0,u=0;for(i[o++]=e[0],i[o++]=e[1],i[o++]=e[2],3===this.order&&(i[o++]=e[3]);e.length>1;){for(n=[],a=0,u=e.length-1;a<u;a++)r=g.lerp(t,e[a],e[a+1]),i[o++]=r,n.push(r);e=n}return i}},{key:"split",value:function(r,e){if(0===r&&e)return this.split(e).left;if(1===e)return this.split(r).right;var n=this.hull(r),i={left:2===this.order?new t([n[0],n[3],n[5]]):new t([n[0],n[4],n[7],n[9]]),right:2===this.order?new t([n[5],n[4],n[2]]):new t([n[9],n[8],n[6],n[3]]),span:n};return i.left._t1=g.map(0,0,1,this._t1,this._t2),i.left._t2=g.map(r,0,1,this._t1,this._t2),i.right._t1=g.map(r,0,1,this._t1,this._t2),i.right._t2=g.map(1,0,1,this._t1,this._t2),e?(e=g.map(e,r,1,0,1),i.right.split(e).left):i}},{key:"extrema",value:function(){var t,r,e=this.dims,n={},i=[];return e.forEach(function(e){r=function(t){return t[e]},t=this.dpoints[0].map(r),n[e]=g.droots(t),3===this.order&&(t=this.dpoints[1].map(r),n[e]=n[e].concat(g.droots(t))),n[e]=n[e].filter((function(t){return t>=0&&t<=1})),i=i.concat(n[e].sort(g.numberSort))}.bind(this)),i=i.sort(g.numberSort).filter((function(t,r){return i.indexOf(t)===r})),n.values=i,n}},{key:"bbox",value:function(){var t=this.extrema(),r={};return this.dims.forEach(function(e){r[e]=g.getminmax(this,e,t[e])}.bind(this)),r}},{key:"overlaps",value:function(t){var r=this.bbox(),e=t.bbox();return g.bboxoverlap(r,e)}},{key:"offset",value:function(r,e){if(void 0!==e){var n=this.get(r),i=this.normal(r),o={c:n,n:i,x:n.x+i.x*e,y:n.y+i.y*e};return this._3d&&(o.z=n.z+i.z*e),o}if(this._linear){var a=this.normal(0);return[new t(this.points.map((function(t){var e={x:t.x+r*a.x,y:t.y+r*a.y};return t.z&&i.z&&(e.z=t.z+r*a.z),e})))]}return this.reduce().map((function(t){return t._linear?t.offset(r)[0]:t.scale(r)}))}},{key:"simple",value:function(){if(3===this.order){var t=g.angle(this.points[0],this.points[3],this.points[1]),r=g.angle(this.points[0],this.points[3],this.points[2]);if(t>0&&r<0||t<0&&r>0)return!1}var e=this.normal(0),n=this.normal(1),i=e.x*n.x+e.y*n.y;return this._3d&&(i+=e.z*n.z),E(T(i))<B/3}},{key:"reduce",value:function(){var t,r,e=0,n=0,i=[],o=[],a=this.extrema().values;for(-1===a.indexOf(0)&&(a=[0].concat(a)),-1===a.indexOf(1)&&a.push(1),e=a[0],t=1;t<a.length;t++)n=a[t],(r=this.split(e,n))._t1=e,r._t2=n,i.push(r),e=n;return i.forEach((function(t){for(e=0,n=0;n<=1;)for(n=e+.01;n<=1.01;n+=.01)if(!(r=t.split(e,n)).simple()){if(E(e-(n-=.01))<.01)return[];(r=t.split(e,n))._t1=g.map(e,0,1,t._t1,t._t2),r._t2=g.map(n,0,1,t._t1,t._t2),o.push(r),e=n;break}e<1&&((r=t.split(e,1))._t1=g.map(e,0,1,t._t1,t._t2),r._t2=t._t2,o.push(r))})),o}},{key:"scale",value:function(r){var e=this.order,n=!1;if("function"==typeof r&&(n=r),n&&2===e)return this.raise().scale(n);var i=this.clockwise,o=n?n(0):r,a=n?n(1):r,u=[this.offset(0,10),this.offset(1,10)],s=g.lli4(u[0],u[0].c,u[1],u[1].c);if(!s)throw new Error("cannot scale this curve. Try reducing it first.");var f=this.points,c=[];return[0,1].forEach((function(t){var r=c[t*e]=g.copy(f[t*e]);r.x+=(t?a:o)*u[t].n.x,r.y+=(t?a:o)*u[t].n.y})),n?([0,1].forEach(function(t){if(2!==this.order||!t){var o=f[t+1],a={x:o.x-s.x,y:o.y-s.y},u=n?n((t+1)/e):r;n&&!i&&(u=-u);var l=C(a.x*a.x+a.y*a.y);a.x/=l,a.y/=l,c[t+1]={x:o.x+u*a.x,y:o.y+u*a.y}}}.bind(this)),new t(c)):([0,1].forEach(function(t){if(2!==this.order||!t){var r=c[t*e],n=this.derivative(t),i={x:r.x+n.x,y:r.y+n.y};c[t+1]=g.lli4(r,i,s,f[t+1])}}.bind(this)),new t(c))}},{key:"outline",value:function(t,r,e,n){r=void 0===r?t:r;var i,o=this.reduce(),a=o.length,u=[],s=[],f=0,c=this.length(),l=void 0!==e&&void 0!==n;function h(t,r,e,n,i){return function(o){var a=n/e,u=(n+i)/e,s=r-t;return g.map(o,0,1,t+a*s,t+u*s)}}o.forEach((function(i){_=i.length(),l?(u.push(i.scale(h(t,e,c,f,_))),s.push(i.scale(h(-r,-n,c,f,_)))):(u.push(i.scale(t)),s.push(i.scale(-r))),f+=_})),s=s.map((function(t){return(i=t.points)[3]?t.points=[i[3],i[2],i[1],i[0]]:t.points=[i[2],i[1],i[0]],t})).reverse();var y=u[0].points[0],x=u[a-1].points[u[a-1].points.length-1],v=s[a-1].points[s[a-1].points.length-1],p=s[0].points[0],m=g.makeline(v,y),d=g.makeline(x,p),z=[m].concat(u).concat([d]).concat(s),_=z.length;return new b(z)}},{key:"outlineshapes",value:function(t,r,e){r=r||t;for(var n=this.outline(t,r).curves,i=[],o=1,a=n.length;o<a/2;o++){var u=g.makeshape(n[o],n[a-o],e);u.startcap.virtual=o>1,u.endcap.virtual=o<a/2-1,i.push(u)}return i}},{key:"intersects",value:function(r,e){return r?r.p1&&r.p2?this.lineIntersects(r):(r instanceof t&&(r=r.reduce()),this.curveintersects(this.reduce(),r,e)):this.selfintersects(e)}},{key:"lineIntersects",value:function(t){var r=S(t.p1.x,t.p2.x),e=S(t.p1.y,t.p2.y),n=M(t.p1.x,t.p2.x),i=M(t.p1.y,t.p2.y),o=this;return g.roots(this.points,t).filter((function(t){var a=o.get(t);return g.between(a.x,r,n)&&g.between(a.y,e,i)}))}},{key:"selfintersects",value:function(t){var r,e,n,i,o=this.reduce(),a=o.length-2,u=[];for(r=0;r<a;r++)n=o.slice(r,r+1),i=o.slice(r+2),e=this.curveintersects(n,i,t),u=u.concat(e);return u}},{key:"curveintersects",value:function(t,r,e){var n=[];t.forEach((function(t){r.forEach((function(r){t.overlaps(r)&&n.push({left:t,right:r})}))}));var i=[];return n.forEach((function(t){var r=g.pairiteration(t.left,t.right,e);r.length>0&&(i=i.concat(r))})),i}},{key:"arcs",value:function(t){t=t||.5;return this._iterate(t,[])}},{key:"_error",value:function(t,r,e,n){var i=(n-e)/4,o=this.get(e+i),a=this.get(n-i),u=g.dist(t,r),s=g.dist(t,o),f=g.dist(t,a);return E(s-u)+E(f-u)}},{key:"_iterate",value:function(t,r){var e,n=0,i=1;do{e=0,i=1;var o,a,u,s,f,c=this.get(n),l=!1,h=!1,y=i,x=1;do{if(h=l,s=u,y=(n+i)/2,o=this.get(y),a=this.get(i),(u=g.getccenter(c,o,a)).interval={start:n,end:i},l=this._error(u,c,n,i)<=t,(f=h&&!l)||(x=i),l){if(i>=1){if(u.interval.end=x=1,s=u,i>1){var v={x:u.x+u.r*j(u.e),y:u.y+u.r*O(u.e)};u.e+=g.angle({x:u.x,y:u.y},v,this.get(1))}break}i+=(i-n)/2}else i=y}while(!f&&e++<100);if(e>=100)break;s=s||u,r.push(s),n=x}while(i<1);return r}},{key:"getUtils",value:function(){return g}},{key:"valueOf",value:function(){return this.toString()}},{key:"toString",value:function(){return g.pointsToString(this.points)}},{key:"toSVG",value:function(){if(this._3d)return!1;for(var t=this.points,r=["M",t[0].x,t[0].y,2===this.order?"Q":"C"],e=1,n=t.length;e<n;e++)r.push(t[e].x),r.push(t[e].y);return r.join(" ")}},{key:"verify",value:function(){var t=this.coordDigest();t!==this._print&&(this._print=t,this.update())}},{key:"coordDigest",value:function(){return this.points.map((function(t,r){return""+r+t.x+t.y+(t.z||0)})).join("")}},{key:"update",value:function(t){this._lut=[],this.dpoints=g.derive(this.points,this._3d),this.computedirection()}},{key:"computedirection",value:function(){var t=this.points,r=g.angle(t[0],t[this.order],t[1]);this.clockwise=r>0}}],[{key:"SVGtoBeziers",value:function(r){return w(t,r)}},{key:"quadraticFromPoints",value:function(r,e,n,i){return void 0===i&&(i=.5),0===i?new t(e,e,n):1===i?new t(r,e,e):new t(r,N(2,r,e,n,i).A,n)}},{key:"cubicFromPoints",value:function(r,e,n,i,o){void 0===i&&(i=.5);var a=N(3,r,e,n,i);void 0===o&&(o=g.dist(e,a.C));var u=o*(1-i)/i,s=g.dist(r,n),f=(n.x-r.x)/s,c=(n.y-r.y)/s,l=o*f,h=o*c,y=u*f,x=u*c,v=e.x-l,p=e.y-h,m=e.x+y,d=e.y+x,z=a.A,b=z.x+(v-z.x)/(1-i),_=z.y+(p-z.y)/(1-i),k=z.x+(m-z.x)/i,w=z.y+(d-z.y)/i;return new t(r,{x:r.x+(b-r.x)/i,y:r.y+(_-r.y)/i},{x:n.x+(k-n.x)/(1-i),y:n.y+(w-n.y)/(1-i)},n)}},{key:"getUtils",value:function(){return g}}]),t}();return o(I,"PolyBezier",b),t.Bezier=I,t.default=I,t}({});Bezier=Bezier.Bezier;
//# sourceMappingURL=bezier.js.map
