NodeList.prototype.array = function() {
  return Array.prototype.slice.call(this);
};

function find(qs) {
  return document.querySelectorAll(qs).array();
}

document.head = document.querySelector("head");

var open = false;

function loadAll() {
  find("figure script[type='text/beziercode']").forEach(function(e, idx) {
    var figure = e.parentNode;
    var code = e.textContent.substring(1).split("\n");
    var indent = "";
    code[0].replace(/^(\s+)/, function(a,b) { indent = b; });
    var len = code.length;
    code = "var curve = " + code.map(function(l) { return l.replace(indent,''); }).join("\n");

    var content = code + "\n      draw();";
    content = content + "\n      handleInteraction(getCanvas(), curve).onupdate = function() { reset(); draw(); }";
    content = "\n    with(Math) { " + content + "\n    }";
    content = "\n  with(drawfunctions) { " + content + "\n  }";
    content = "(function(drawfunctions) { " + content + "\n} (bindDrawFunctions( " + idx + " )) );\n";
    e.textContent = content;
    e.setAttribute("type", "text/javascript");
    document.head.appendChild(e);

    var codearea = document.createElement("textarea");
    codearea.textContent = code;
    codearea.setAttribute("style", "height: " + (16*(len-1)) + "px!important;");
    figure.appendChild(codearea);
    var button = document.createElement("button");
    button.textContent = "view source";
    figure.appendChild(button);
    button.onclick = function(evt) {
      if(open && open!==codearea) { open.classList.remove("showcode"); }
      if(codearea.classList.contains("showcode")) {
        codearea.classList.remove("showcode");
      } else {
        codearea.classList.add("showcode");
        open = codearea;
      }
      evt.stopPropagation();
    };
    document.addEventListener("click", function() {
      if(codearea.classList.contains("showcode")) {
        codearea.classList.remove("showcode");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", loadAll);
