'use strict';

/** @class CertificateGenerator */
class CertificateGenerator {
    static makeId() {
        const existing = MMAStorage.getCertId();
        if (existing) return existing;
        const id = 'MMA-' + Date.now().toString(36).toUpperCase().slice(-6) +
            '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        MMAStorage.setCertId(id);
        return id;
    }

    static render(name, score, grade) {
        const id = this.makeId();
        const date = new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        document.getElementById('certName').textContent = name;
        document.getElementById('certScore').textContent = score + ' / ' + TOTAL_MAX;
        document.getElementById('certGrade').textContent = grade;
        document.getElementById('certDate').textContent = date;
        document.getElementById('certId').textContent = id;
        const stars = grade === 'A+' ? 5 : grade === 'A' ? 4 : grade === 'B' ? 3 : 2;
        document.getElementById('certStars').textContent = '★'.repeat(stars);
        return { id, date, score, grade };
    }

    static download() {
        const cert = document.getElementById('certificate');
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Certificate</title>
            <link rel="stylesheet" href="css/mma.css"></head><body>${cert.outerHTML}</body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'Mouse-Master-Certificate.html';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    static print() { window.print(); }
}

window.MMACert = CertificateGenerator;
