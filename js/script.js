 // ─── STATE ───
        let currentType = 'url', currentEC = 'M', currentFmt = 'png', currentApiUrl = '';
        let logoDataUrl = null, logoSizePct = 25;

        // ─── LOGO UPLOAD ───
        function handleLogoUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { showToast('⚠', 'Arquivo inválido. Use PNG, JPG ou SVG.'); return; }

            const reader = new FileReader();
            reader.onload = (ev) => {
                logoDataUrl = ev.target.result;

                // Show in dropzone
                const dz = document.getElementById('logo-dropzone');
                dz.classList.add('has-logo');
                document.getElementById('dz-icon').style.display = 'none';
                document.getElementById('dz-text').style.display = 'none';

                const existImg = dz.querySelector('img.dz-preview');
                if (existImg) existImg.remove();
                const prev = document.createElement('img');
                prev.className = 'dz-preview';
                prev.src = logoDataUrl;
                dz.appendChild(prev);

                // Show controls
                document.getElementById('logo-preview-section').style.display = 'block';
                document.getElementById('btn-remove-logo').classList.add('visible');

                // Auto set EC to H when logo present
                document.querySelectorAll('[data-ec]').forEach(p => p.classList.remove('active'));
                document.querySelector('[data-ec="H"]').classList.add('active');
                currentEC = 'H';
                document.getElementById('ec-auto-note').style.display = 'inline';

                showToast('🖼', 'Logo carregado! EC definido para H.');
            };
            reader.readAsDataURL(file);
        }

        function removeLogo() {
            logoDataUrl = null;
            const dz = document.getElementById('logo-dropzone');
            dz.classList.remove('has-logo');
            document.getElementById('dz-icon').style.display = 'flex';
            document.getElementById('dz-text').style.display = 'block';
            const prev = dz.querySelector('img.dz-preview');
            if (prev) prev.remove();
            document.getElementById('logo-file').value = '';
            document.getElementById('logo-preview-section').style.display = 'none';
            document.getElementById('btn-remove-logo').classList.remove('visible');
            document.getElementById('ec-auto-note').style.display = 'none';

            // Remove logo overlay from QR
            const overlay = document.querySelector('.logo-overlay');
            if (overlay) overlay.remove();

            showToast('🗑', 'Logo removido.');
        }

        function updateLogoSize(val) {
            logoSizePct = parseInt(val);
            document.getElementById('logo-size-display').textContent = val + '%';
            // Update overlay if QR exists
            updateLogoOverlay();
        }

        function updateLogoOverlay() {
            const existing = document.querySelector('.logo-overlay');
            if (existing) existing.remove();

            if (!logoDataUrl) return;
            const qrImg = document.querySelector('#qr-output img.qr-img');
            if (!qrImg) return;

            const qrSize = 190;
            const logoSize = Math.round(qrSize * (logoSizePct / 100));

            const overlay = document.createElement('div');
            overlay.className = 'logo-overlay';
            overlay.style.width = logoSize + 'px';
            overlay.style.height = logoSize + 'px';

            const img = document.createElement('img');
            img.src = logoDataUrl;
            img.style.width = logoSize - 6 + 'px';
            img.style.height = logoSize - 6 + 'px';
            img.style.objectFit = 'contain';
            overlay.appendChild(img);

            document.getElementById('qr-output').appendChild(overlay);
        }

        // ─── TYPE TABS ───
        document.querySelectorAll('.type-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentType = tab.dataset.type;
                updateInputArea();
            });
        });

        function updateInputArea() {
            const mf = document.getElementById('main-field');
            const wf = document.getElementById('wifi-extra');
            const vf = document.getElementById('vcard-extra');
            mf.style.display = 'flex'; wf.style.display = 'none'; vf.style.display = 'none';
            const map = { url: ['URL', 'https://exemplo.com.br'], text: ['Texto', 'Escreva seu texto aqui...'], email: ['E-mail', 'contato@email.com'], phone: ['Telefone', '+55 11 99999-9999'] };
            if (currentType === 'wifi') { mf.style.display = 'none'; wf.style.display = 'flex'; }
            else if (currentType === 'vcard') { mf.style.display = 'none'; vf.style.display = 'flex'; }
            else {
                document.getElementById('main-label').textContent = map[currentType][0];
                document.getElementById('main-input').placeholder = map[currentType][1];
            }
        }

        // ─── EC PILLS ───
        document.querySelectorAll('[data-ec]').forEach(p => {
            p.addEventListener('click', () => {
                document.querySelectorAll('[data-ec]').forEach(x => x.classList.remove('active'));
                p.classList.add('active'); currentEC = p.dataset.ec;
            });
        });

        // ─── FORMAT PILLS ───
        document.querySelectorAll('[data-fmt]').forEach(p => {
            p.addEventListener('click', () => {
                document.querySelectorAll('[data-fmt]').forEach(x => x.classList.remove('active'));
                p.classList.add('active'); currentFmt = p.dataset.fmt;
                document.getElementById('dl-fmt').textContent = p.dataset.fmt.toUpperCase();
            });
        });

        // ─── COLOR SYNC ───
        const qrCP = document.getElementById('qr-color'), qrCH = document.getElementById('qr-color-hex');
        const bgCP = document.getElementById('bg-color'), bgCH = document.getElementById('bg-color-hex');
        qrCP.addEventListener('input', () => qrCH.value = qrCP.value.toUpperCase());
        qrCH.addEventListener('input', () => { if (/^#[0-9A-Fa-f]{6}$/.test(qrCH.value)) qrCP.value = qrCH.value; });
        bgCP.addEventListener('input', () => bgCH.value = bgCP.value.toUpperCase());
        bgCH.addEventListener('input', () => { if (/^#[0-9A-Fa-f]{6}$/.test(bgCH.value)) bgCP.value = bgCH.value; });

        // ─── SIZE RANGE ───
        document.getElementById('qr-size').addEventListener('input', function () {
            document.getElementById('size-display').textContent = `${this.value} × ${this.value}`;
        });

        // ─── BUILD CONTENT ───
        function getContent() {
            switch (currentType) {
                case 'url': return document.getElementById('main-input').value.trim() || 'https://qrify.app';
                case 'text': return document.getElementById('main-input').value.trim() || 'Olá Mundo!';
                case 'email': return 'mailto:' + (document.getElementById('main-input').value.trim() || 'email@exemplo.com');
                case 'phone': return 'tel:' + (document.getElementById('main-input').value.trim() || '+5511999999999').replace(/\s/g, '');
                case 'wifi': {
                    const s = document.getElementById('wifi-ssid').value.trim() || 'MinhaRede';
                    const p = document.getElementById('wifi-pass').value;
                    const t = document.getElementById('wifi-sec').value || 'WPA';
                    return `WIFI:T:${t};S:${s};P:${p};;`;
                }
                case 'vcard': {
                    const n = document.getElementById('vc-name').value.trim() || 'Nome Sobrenome';
                    const o = document.getElementById('vc-org').value.trim();
                    const ph = document.getElementById('vc-phone').value.trim();
                    const em = document.getElementById('vc-email').value.trim();
                    const url = document.getElementById('vc-url').value.trim();
                    return `BEGIN:VCARD\nVERSION:3.0\nFN:${n}${o ? '\nORG:' + o : ''}${ph ? '\nTEL:' + ph : ''}${em ? '\nEMAIL:' + em : ''}${url ? '\nURL:' + url : ''}\nEND:VCARD`;
                }
            }
            return '';
        }

        // ─── BUILD API URL ───
        function buildApiUrl(content) {
            const size = document.getElementById('qr-size').value;
            const fg = (qrCH.value || '#687EE3').replace('#', '');
            const bg = (bgCH.value || '#ffffff').replace('#', '');
            const ecc = logoDataUrl ? 'H' : currentEC;
            const params = new URLSearchParams({
                data: content,
                size: `${size}x${size}`,
                color: fg,
                bgcolor: bg,
                ecc: ecc,
                format: currentFmt,
                margin: '1',
                qzone: '1'
            });
            return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
        }

        // ─── GENERATE QR ───
        async function generateQR() {
            const content = getContent();
            const btn = document.getElementById('gen-btn');
            const output = document.getElementById('qr-output');
            const frame = document.getElementById('qr-frame');

            btn.disabled = true;
            btn.innerHTML = '<div class="spinner"></div> Chamando API...';

            const apiUrl = buildApiUrl(content);
            currentApiUrl = apiUrl;

            document.getElementById('api-url-text').textContent = apiUrl.replace('https://api.qrserver.com/v1/create-qr-code/?', '?');
            document.getElementById('api-url-box').classList.add('visible');

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.className = 'qr-img';

            const loadPromise = new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
                img.src = apiUrl + '&_t=' + Date.now();
            });

            try {
                await loadPromise;
                output.innerHTML = '';
                output.appendChild(img);
                frame.classList.add('has-qr');

                // Add logo overlay if exists
                if (logoDataUrl) {
                    setTimeout(updateLogoOverlay, 50);
                }

                document.getElementById('dl-btn').disabled = false;
                document.getElementById('copy-btn').disabled = false;
                showToast('✦', logoDataUrl ? 'QR Code com logo gerado!' : 'QR Code gerado via API!');
            } catch (e) {
                output.innerHTML = `<div class="qr-placeholder"><p style="color:#FF6B6B;font-size:13px">Erro ao contactar API.<br>Verifique os dados.</p></div>`;
                frame.classList.remove('has-qr');
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>Gerar via API`;
            }
        }

        // ─── DOWNLOAD ───
        function downloadQR() {
            if (!currentApiUrl) return;
            // If logo, download merged canvas
            if (logoDataUrl) {
                downloadWithLogo();
                return;
            }
            const a = document.createElement('a');
            a.href = currentApiUrl; a.download = `qrcode.${currentFmt}`; a.target = '_blank';
            a.click();
            showToast('⬇', `Baixando ${currentFmt.toUpperCase()}...`);
        }

        function downloadWithLogo() {
            const qrImg = document.querySelector('#qr-output img.qr-img');
            if (!qrImg) return;
            const size = 512;
            const canvas = document.createElement('canvas');
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');

            const qr = new Image();
            qr.crossOrigin = 'anonymous';
            qr.onload = () => {
                ctx.drawImage(qr, 0, 0, size, size);
                const logo = new Image();
                logo.onload = () => {
                    const ls = Math.round(size * (logoSizePct / 100));
                    const lx = (size - ls) / 2, ly = (size - ls) / 2;
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.roundRect(lx - 4, ly - 4, ls + 8, ls + 8, 8);
                    ctx.fill();
                    ctx.drawImage(logo, lx, ly, ls, ls);
                    canvas.toBlob(blob => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'qrcode-logo.png'; a.click();
                        showToast('⬇', 'QR Code com logo baixado!');
                    });
                };
                logo.src = logoDataUrl;
            };
            qr.src = currentApiUrl;
        }

        // ─── COPY URL ───
        function copyURL() {
            if (!currentApiUrl) return;
            navigator.clipboard.writeText(currentApiUrl)
                .then(() => showToast('📋', 'URL da API copiada!'))
                .catch(() => prompt('URL da API:', currentApiUrl));
        }

        // ─── TOAST ───
        function showToast(icon, msg) {
            document.getElementById('toast-icon').textContent = icon;
            document.getElementById('toast-msg').textContent = msg;
            const t = document.getElementById('toast');
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 2800);
        }

        document.addEventListener('keydown', e => { if (e.key === 'Enter') generateQR(); });
        setTimeout(generateQR, 500);


