// assets/form.js
// Lightweight AJAX form submission for Formspree (or any email API)
// Works with your existing <form action="https://formspree.io/f/XXXX__;!!C8mu0vCj!cdB8YvnPbAt7-POFImliMEEhNIavGZvxVLEpwze5qGZIZSku13oHHwvvGxed9AH7mNu6cvZcgn0AdpGlZy8As0UzGGTDzQ$" method="POST">

(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function createStatusEl() {
    const p = document.createElement('p');
    p.className = 'small';
    p.setAttribute('role', 'status');
    p.style.marginTop = '8px';
    return p;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = $('section#contact form') || $('form.form');
    if (!form) return;

    // Add a status line after the submit button if none exists
    let status = form.querySelector('[data-form-status]');
    if (!status) {
      status = createStatusEl();
      status.dataset.formStatus = 'true';
      form.appendChild(status);
    }

    const submitBtn = form.querySelector('button[type="submit"]');

    async function handleSubmit(e) {
      e.preventDefault();

      // Optional honeypot (add <input name="_gotcha" style="display:none"> to your form)
      const pot = form.querySelector('input[name="_gotcha"]');
      if (pot && pot.value) {
        form.reset();
        status.textContent = "Thanks! We'll be in touch soon.";
        return;
      }

      // Disable button while sending
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      status.textContent = '';

      try {
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.reset();
          status.textContent = 'Thanks! Your message has been sent.';
        } else {
          let msg = 'Oops — something went wrong. Please try again.';
          try {
            const out = await res.json();
            if (out && out.errors) {
              msg = out.errors.map(e => e.message).join(', ');
            }
          } catch (_) {}
          status.textContent = msg;
        }
      } catch (err) {
        status.textContent = 'Network error — please check your connection and try again.';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send';
        }
      }
    }

    form.addEventListener('submit', handleSubmit);
  });
})();
