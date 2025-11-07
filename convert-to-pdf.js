// Simple script to convert HTML to PDF using puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function convertToPDF() {
    try {
        const htmlPath = path.join(__dirname, 'Betting_App_Demo_FINAL.html');
        const pdfPath = path.join(__dirname, 'Betting_App_Demo_FINAL.pdf');
        
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        await page.pdf({
            path: pdfPath,
            format: 'Letter',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });
        
        await browser.close();
        
        console.log(`✅ PDF created successfully: ${pdfPath}`);
    } catch (error) {
        console.error('Error creating PDF:', error);
        console.log('\n📄 Alternative: Open Betting_App_Demo_FINAL.html in your browser and use Print to PDF');
    }
}

convertToPDF();


