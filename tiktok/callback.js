// Página de retorno de OAuth de TikTok para Weskitol Clips.
// Lee code, state, scopes, error y error_description de la dirección y los muestra para copiarlos.
// No envía nada a ningún servidor ni guarda nada en el navegador (la CSP de la página bloquea
// además cualquier conexión: connect-src 'none').
(function () {
  "use strict";

  // Separa "a=1&b=2" sin convertir "+" en espacio: el code de TikTok puede traer caracteres
  // especiales y un "+" literal debe llegar intacto a la herramienta.
  function leerParametros(texto) {
    var resultado = {};
    if (!texto) {
      return resultado;
    }
    texto.split("&").forEach(function (parte) {
      if (!parte) {
        return;
      }
      var i = parte.indexOf("=");
      var nombre = i === -1 ? parte : parte.slice(0, i);
      var valor = i === -1 ? "" : parte.slice(i + 1);
      try {
        nombre = decodeURIComponent(nombre);
      } catch (e) {
        // se deja tal cual
      }
      try {
        valor = decodeURIComponent(valor);
      } catch (e) {
        // un "%" suelto: se muestra sin decodificar para no perder el valor
      }
      if (!Object.prototype.hasOwnProperty.call(resultado, nombre)) {
        resultado[nombre] = valor;
      }
    });
    return resultado;
  }

  var consulta = leerParametros(window.location.search.replace(/^\?/, ""));
  // TikTok responde en la consulta (?code=...). Por si alguna vez llega en el fragmento (#...), se mira también.
  if (!("code" in consulta) && !("error" in consulta)) {
    var fragmento = leerParametros(window.location.hash.replace(/^#/, ""));
    if ("code" in fragmento || "error" in fragmento) {
      consulta = fragmento;
    }
  }

  function valor(nombre) {
    return Object.prototype.hasOwnProperty.call(consulta, nombre) ? String(consulta[nombre]).trim() : "";
  }

  function el(id) {
    return document.getElementById(id);
  }

  function mostrar(id) {
    el(id).hidden = false;
  }

  function poner(idCampo, idValor, texto) {
    if (!texto) {
      return false;
    }
    el(idValor).value = texto; // .value: el texto nunca se interpreta como HTML
    mostrar(idCampo);
    return true;
  }

  var code = valor("code");
  var state = valor("state");
  var scopes = valor("scopes").replace(/\+/g, " ");
  var error = valor("error");
  var descripcion = valor("error_description").replace(/\+/g, " ");

  if (error) {
    el("valor-error").value = error;
    poner("campo-error-descripcion", "valor-error-descripcion", descripcion);
    mostrar("bloque-error");
  }

  var hayCode = poner("campo-code", "valor-code", code);
  var hayState = poner("campo-state", "valor-state", state);
  poner("campo-scopes", "valor-scopes", scopes);

  if (hayCode) {
    mostrar("consejos");
    poner("campo-url", "valor-url", window.location.href);
  }
  if (hayCode || hayState) {
    mostrar("resultado");
  }
  if (!hayCode && !error) {
    mostrar("sin-datos");
  }

  // ---- Copiar ----

  function avisar(idValor, texto) {
    var estado = el("estado-" + idValor);
    if (estado) {
      estado.textContent = texto;
    }
  }

  function copiaManual(campo) {
    // Plan B para navegadores sin API de portapapeles o sin HTTPS.
    campo.focus();
    campo.select();
    try {
      campo.setSelectionRange(0, campo.value.length);
    } catch (e) {
      // algunos navegadores no lo permiten en campos de solo lectura
    }
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    return ok;
  }

  function copiar(idValor) {
    var campo = el(idValor);
    var texto = campo.value;
    var fallo = function () {
      if (copiaManual(campo)) {
        avisar(idValor, "Copiado.");
      } else {
        avisar(idValor, "No se pudo copiar solo. Ya quedó seleccionado: cópialo a mano.");
      }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(function () {
        avisar(idValor, "Copiado.");
      }, fallo);
    } else {
      fallo();
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-copiar]"), function (boton) {
    boton.addEventListener("click", function () {
      copiar(boton.getAttribute("data-copiar"));
    });
  });
})();
