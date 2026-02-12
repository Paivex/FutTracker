export const Utils = {
    formatarData(data) {
        const d = new Date(data)
        if (isNaN(d.getTime())) return 'Data inválida'

        return d.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    },

    formatarDataComDiaSemana(data) {

        if (!data) return ''
        const d = new Date(data)
        if (isNaN(d.getTime())) return 'Data inválida'

        const diaMesAno = d.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        const diaSemana = d.toLocaleDateString('pt-PT', {
            weekday: 'long'
        })

        return `${diaMesAno} ${diaSemana}`
    },

    formatarDataCompleta(data) {

        if (!data) return ''
        const d = new Date(data)
        if (isNaN(d.getTime())) return 'Data inválida'

        const diaMesAno = d.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        const diaSemana = d.toLocaleDateString('pt-PT', {
            weekday: 'long'
        })

        return `${diaMesAno} ${diaSemana}`
    },

    getNomeMes(numeroMes) {
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return meses[numeroMes];
    },

    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    resizeImage(file, targetWidth = 1200, targetHeight = 1500) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    const imgRatio = img.width / img.height;
                    const targetRatio = targetWidth / targetHeight;
                    let sx, sy, sWidth, sHeight;

                    if (imgRatio > targetRatio) {
                        sHeight = img.height;
                        sWidth = img.height * targetRatio;
                        sx = (img.width - sWidth) / 2;
                        sy = 0;
                    } else {
                        sWidth = img.width;
                        sHeight = img.width / targetRatio;
                        sx = 0;
                        sy = (img.height - sHeight) / 2;
                    }

                    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
                    resolve(canvas.toDataURL('image/webp', 0.8));
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
        
    }
    
};