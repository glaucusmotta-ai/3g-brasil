(function () {
  // Lê o parâmetro ?plano= da URL
  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  var planoTxt = getQueryParam('plano') || '—';

  var planoLabel = document.getElementById('plano-label');
  var planoInput = document.getElementById('plano-input');

  if (planoLabel) planoLabel.textContent = planoTxt;
  if (planoInput) planoInput.value = planoTxt;

  var form   = document.getElementById('assinatura-form');
  var msgBox = document.getElementById('assinatura-msg');

  if (!form || !msgBox) return;

  // Decide para onde enviar o POST
  var isFile   = window.location.protocol === 'file:';
  var API_BASE = isFile ? 'http://127.0.0.1:8000' : '';

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    msgBox.textContent = 'Enviando sua assinatura...';
    msgBox.style.color = '#555';

    var formData = new FormData(form);

    var nome     = (formData.get('nome')     || '').trim();
    var email    = (formData.get('email')    || '').trim();
    var telefone = (formData.get('telefone') || '').trim();
    var vendedor = (formData.get('vendedor') || '').trim();
    var plano    = (formData.get('plano')    || '').trim();

    // Validações básicas
    if (!nome || !email || !plano) {
      msgBox.textContent = 'Por favor, preencha nome, e-mail e selecione um plano.';
      msgBox.style.color = 'red';
      return;
    }

    // Define o valor em centavos conforme o texto do plano
    var valorCentavos = 0;
    if (plano.indexOf('Mensal individual') >= 0) {
      valorCentavos = 2290;
    } else if (plano.indexOf('Anual individual') >= 0) {
      valorCentavos = 2000;
    } else if (plano.indexOf('Mensal família') >= 0) {
      valorCentavos = 1890;
    } else if (plano.indexOf('Anual família') >= 0) {
      valorCentavos = 1700;
    }

    if (!valorCentavos) {
      msgBox.textContent = 'Não foi possível identificar o valor do plano. Tente escolher o plano novamente.';
      msgBox.style.color = 'red';
      return;
    }

    // Payload no formato que o backend já conhece
    var payload = {
      user_email: email,
      plano: plano,
      valor_mensal_centavos: valorCentavos
      // (nome, telefone, vendedor a gente guarda depois no backend, em outro passo)
    };

    console.log('Enviando assinatura para:', API_BASE + '/api/assinaturas/site', payload);

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }

    fetch(API_BASE + '/api/assinaturas/site', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function (resp) {
      if (!resp.ok) {
        throw new Error('HTTP ' + resp.status);
      }
      return resp.json().catch(function () { return null; });
    })
    .then(function (data) {
      msgBox.textContent = '🎉 Assinatura recebida com sucesso! Em breve você receberá um e-mail com os próximos passos.';
      msgBox.style.color = 'green';
      form.reset();
    })
    .catch(function (err) {
      console.error('Erro ao enviar assinatura:', err);
      msgBox.textContent = '😔 Não foi possível enviar sua assinatura agora. Tente novamente em alguns instantes.';
      msgBox.style.color = 'red';
    })
    .finally(function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar solicitação';
      }
    });
  });
})();
