(function () {
  var form = document.getElementById("cancel-form");
  var btnVoltar = document.getElementById("btn-voltar");
  var btnCancelar = document.getElementById("btn-cancelar");
  var msg = document.getElementById("msg");

  var inpCodigo = document.getElementById("codigo_cliente");
  var inpTel = document.getElementById("telefone");

  // IMPORTANTE:
  // - Local: http://127.0.0.1:8000
  // - Produção: você vai trocar para https://anjo-track.3g-brasil.com
  var API_BASE_URL = "http://127.0.0.1:8000";

  function setMsg(text, ok) {
    if (!msg) return;
    msg.textContent = text || "";
    msg.style.color = ok ? "#065f46" : "#b91c1c";
  }

  function normCodigo(v) {
    v = (v || "").trim().toUpperCase();
    v = v.replace(/\s+/g, "");
    return v;
  }

  function normTel(v) {
    v = (v || "").trim();
    v = v.replace(/\s+/g, "");
    return v;
  }

  if (btnVoltar) {
    btnVoltar.addEventListener("click", function () {
      window.location.href = "/";
    });
  }

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setMsg("", true);

    var codigo = normCodigo(inpCodigo ? inpCodigo.value : "");
    var tel = normTel(inpTel ? inpTel.value : "");

    if (!codigo || !tel) {
      setMsg("Preencha o Código do Cliente e o Telefone antes de continuar.", false);
      return;
    }
    if (tel.indexOf("+") !== 0) {
      setMsg("O telefone deve estar no formato E.164 (começando com +). Ex.: +5511999999999", false);
      return;
    }

    if (btnCancelar) {
      btnCancelar.disabled = true;
      btnCancelar.textContent = "Cancelando...";
    }

    fetch(API_BASE_URL + "/api/assinaturas/cancelar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo_cliente: codigo,
        telefone: tel
      })
    })
      .then(function (resp) {
        return resp.json().then(function (data) {
          return { ok: resp.ok, data: data };
        });
      })
      .then(function (r) {
        var data = r.data || {};
        if (r.ok && data.ok) {
          setMsg("Assinatura cancelada com sucesso. Você não terá nova cobrança.", true);
          if (btnCancelar) btnCancelar.textContent = "Cancelado";
          form.reset();
          return;
        }

        // mensagens amigáveis
        var reason = (data && data.reason) ? String(data.reason) : "ERRO";
        if (reason === "CLIENT_CODE_NOT_FOUND") {
          setMsg("Código do cliente não encontrado. Confira e tente novamente.", false);
        } else if (reason === "PHONE_MISMATCH") {
          setMsg("Telefone não confere com o cadastro desse código. Verifique e tente novamente.", false);
        } else if (reason === "ALREADY_CANCELLED") {
          setMsg("Essa assinatura já está cancelada.", true);
        } else {
          setMsg("Não foi possível cancelar agora. Tente novamente em alguns instantes.", false);
        }
      })
      .catch(function (err) {
        console.error(err);
        setMsg("Falha de conexão com o servidor. Tente novamente em alguns instantes.", false);
      })
      .finally(function () {
        if (btnCancelar) {
          btnCancelar.disabled = false;
          btnCancelar.textContent = "Confirmar cancelamento";
        }
      });
  });
})();
