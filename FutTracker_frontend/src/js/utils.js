export const Utils = {
    formatarData(data) {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-PT', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    },

    formatarDataCompleta(data) {
        const d = new Date(data + 'T00:00:00');
        const diaMesAno = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const diaSemana = d.toLocaleDateString('pt-PT', { weekday: 'long' });
        return `${diaMesAno} - ${diaSemana}`;
    },

    getNomeMes(numeroMes) {
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return meses[numeroMes];
    },

    resizeImage(file, targetWidth = 644, targetHeight = 900) {
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
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }
};