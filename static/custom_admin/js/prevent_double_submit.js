document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form#news_form, #content-main form, form.change-form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            if (form.dataset.submitting === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            form.dataset.submitting = 'true';

            const submitButtons = form.querySelectorAll('input[type="submit"], button[type="submit"]');
            setTimeout(function() {
                submitButtons.forEach(function(btn) {
                    btn.disabled = true;
                    btn.style.opacity = '0.6';
                    btn.style.cursor = 'not-allowed';
                    if (btn.value && !btn.value.includes('...')) {
                        btn.value = btn.value + '...';
                    }
                });
            }, 30);
        });
    });
});
