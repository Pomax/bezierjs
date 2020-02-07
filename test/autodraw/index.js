import { Handler } from "./Handler.js";

var cvs = document.querySelector("canvas");
cvs.width = window.innerWidth;
var ctx = cvs.getContext("2d");
var handler = new Handler(cvs);
ctx.strokeStyle = "black";

cvs.addEventListener("pointerdown", evt => handler.start(evt));
cvs.addEventListener("pointermove", evt => handler.record(evt));
cvs.addEventListener("pointerup", evt => handler.end(evt));
