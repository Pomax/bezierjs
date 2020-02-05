var cvs = document.querySelector("canvas");
cvs.width = cvs.getBoundingClientRect().width;
var ctx = cvs.getContext("2d");
var handler = new Handler(cvs);
ctx.strokeStyle = "black";

cvs.addEventListener("mousedown", evt => handler.md(evt));
cvs.addEventListener("mousemove", evt => handler.mm(evt));
cvs.addEventListener("mouseup", evt => handler.me(evt));

cvs.addEventListener("pointerdown", evt => handler.md(evt));
cvs.addEventListener("pointermove", evt => handler.mm(evt));
cvs.addEventListener("pointerup", evt => handler.me(evt));
