(function () {
    'use strict';

    /* =====================================================
       CONFIGURATION
       ===================================================== */
    // ⚠️ REMPLACEZ PAR VOTRE URL FORMCARRY
    const FORMCARRY_ENDPOINT = 'https://formcarry.com/s/MNNQf3KKUXD';
    const STORAGE_KEY = 'spyskin_order_draft_v1';
    const FIELDS = ['fullName', 'email', 'phone', 'organization', 'message', 'consent', 'skinSelected'];

    /* =====================================================
       RÉFÉRENCES DOM
       ===================================================== */
    const buyBtns    = document.querySelectorAll('.btn-buy');
    const closeBtn   = document.getElementById('closeFormBtn');
    const overlay    = document.getElementById('modalOverlay');
    const form       = document.getElementById('contactForm');
    const submitBtn  = document.getElementById('submitBtn');
    const statusDiv  = document.getElementById('statusMessage');
    
    
    const skinInput         = document.getElementById('skinSelected');
    const selectedItemDisplay = document.getElementById('selectedItemDisplay');
    const selectedItemName  = document.getElementById('selectedItemName');

    /* =====================================================
       HISTORY API
       ===================================================== */
    function isFormOpenInUrl() {
        return new URL(window.location.href).searchParams.get('form') === 'open';
    }

    function openModal(skinName) {
        if (skinName) {
            skinInput.value = skinName;
            selectedItemName.textContent = skinName;
            selectedItemDisplay.style.display = 'block';
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        const url = new URL(window.location.href);
        url.searchParams.set('form', 'open');
        window.history.pushState({ modal: 'open' }, '', url);

        restoreFromStorage();
    }

    function closeModalVisual() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        hideStatus();
    }

    function closeModalAndHistory() {
        if (isFormOpenInUrl()) {
            window.history.back();
        } else {
            closeModalVisual();
            const url = new URL(window.location.href);
            url.searchParams.delete('form');
            window.history.replaceState({}, '', url);
        }
    }

    window.addEventListener('popstate', function () {
        if (isFormOpenInUrl()) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            restoreFromStorage();
        } else {
            closeModalVisual();
        }
    });

    /* =====================================================
       LOCALSTORAGE
       ===================================================== */
    function saveToStorage() {
        const data = {};
        FIELDS.forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            data[id] = el.type === 'checkbox' ? el.checked : el.value;
        });
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
            console.warn('LocalStorage error', err);
        }
    }

    function restoreFromStorage() {
        let raw;
        try { raw = localStorage.getItem(STORAGE_KEY); } catch (err) { return; }
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            FIELDS.forEach(function (id) {
                const el = document.getElementById(id);
                if (!el) return;
                if (el.type === 'checkbox') {
                    el.checked = Boolean(data[id]);
                } else {
                    el.value = data[id] || '';
                }
            });
            
            if (data['skinSelected']) {
                selectedItemName.textContent = data['skinSelected'];
                selectedItemDisplay.style.display = 'block';
            }
        } catch (err) {
            console.warn('Parse error', err);
        }
    }

    function clearStorage() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {}
    }

    FIELDS.forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', saveToStorage);
            el.addEventListener('change', saveToStorage);
        }
    });

    /* =====================================================
       MESSAGES & SOUMISSION
       ===================================================== */
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'form__status ' + type;
    }

    function hideStatus() {
        statusDiv.textContent = '';
        statusDiv.className = 'form__status';
    }

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.classList.toggle('loading', isLoading);
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        hideStatus();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData(form);

            const response = await fetch(FORMCARRY_ENDPOINT, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            const data = await response.json();

            if (response.ok && (data.code === 200 || data.success === true)) {
                showStatus('✓ Заказ успешно оформлен! Мы свяжемся с вами.', 'success');
                
                form.reset();
                clearStorage();
                selectedItemDisplay.style.display = 'none';

                setTimeout(function () {
                    closeModalAndHistory();
                    setLoading(false);
                }, 3000);
            } else {
                throw new Error(data.message || 'Erreur');
            }
        } catch (error) {
            console.error(error);
            showStatus('✕ Ошибка отправки. Попробуйте позже.', 'error');
            setLoading(false);
        }
    });

    /* =====================================================
       ÉVÉNEMENTS
       ===================================================== */
    buyBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const skinName = btn.getAttribute('data-skin');
            openModal(skinName);
        });
    });

    closeBtn.addEventListener('click', closeModalAndHistory);

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            closeModalAndHistory();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && overlay.classList.contains('active')) {
            closeModalAndHistory();
        }
    });

    if (isFormOpenInUrl()) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        restoreFromStorage();
    }

})();