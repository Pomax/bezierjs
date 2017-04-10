NodeList.prototype.array = function() {
  return Array.prototype.slice.call(this);
};

function find(qs) {
  return document.querySelectorAll(qs).array();
}

var open = false;

function loadAll() {
  var list = find("figure script[type='text/beziercode']");
  list.forEach(function(e, idx) {
    var figure = e.parentNode;
    var code = e.textContent.substring(1).split("\n");
    e.parentNode.removeChild(e);
    var indent = "";
    code[0].replace(/^(\s+)/, function(a,b) { indent = b; });
    var len = code.length;
    code = "var curve = " + code.map(function(l) { return l.replace(indent,''); }).join("\n");

    var content = code + "\n      draw();";
    content = content + "\n      handleInteraction(getCanvas(), curve).onupdate = function(evt) { reset(); draw(evt); }";
    content = "\n    with(Math) { " + content + "\n    }";
    content = "\n  with(drawfunctions) { " + content + "\n  }";
    content = "(function(drawfunctions) { " + content + "\n} (bindDrawFunctions( " + idx + " )) );\n";

    var codearea = document.createElement("div");
    codearea.classList.add("textarea");
    codearea.textContent = code;
    codearea.setAttribute("style", "height: " + (16*(len-1)) + "px!important;");
    figure.appendChild(codearea);

    var ns = document.createElement("script");
    ns.textContent = content;
    document.querySelector("head").appendChild(ns);
  });
}

document.addEventListener("DOMContentLoaded", loadAll);
