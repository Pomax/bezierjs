function find(qs) {
  return Array.from(document.querySelectorAll(qs));
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

    code = code.map(l => l.replace(indent,'')).join("\n");

    var content = `
      var curve = ${code};
      var code = new CodeExample(${idx});
      code.draw = draw.bind(code);
      handleInteraction(code.getCanvas(), curve).onupdate = evt => {
        code.reset();
        code.draw(evt);
      };
      code.draw();
    `

    var codearea = document.createElement("div");
    codearea.classList.add("textarea");
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

    var ns = document.createElement("script");
    ns.type = "module";
    ns.textContent = `
      import { Bezier } from "./js/bezier.js";
      import { CodeExample } from "./js/code-example.js";
      import handleInteraction from "./js/interaction.js";

      ${content}
    `;
    document.querySelector("head").appendChild(ns);
  });
}

document.addEventListener("DOMContentLoaded", loadAll);
