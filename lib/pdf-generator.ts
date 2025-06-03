/**
 * Simple PDF generation utilities using browser's print functionality
 */

// Simple function to download text content
function downloadTextFile(content: string, filename: string): void {
  const element = document.createElement("a")
  const file = new Blob([content], { type: "text/plain;charset=utf-8" })
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(element.href)
}

// Function to open printable version
function createPrintableWindow(content: string, title: string): void {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Could not open print window. Please check your popup blocker settings.")
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          @page { margin: 1in; size: A4; }
          body { 
            font-family: 'Times New Roman', serif; 
            font-size: 12pt; 
            line-height: 1.6; 
            color: #000; 
            max-width: 8.5in; 
            margin: 0 auto; 
            padding: 0; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 10px; 
          }
          .title { 
            font-size: 18pt; 
            font-weight: bold; 
            margin: 0; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
          }
          .content { white-space: pre-wrap; text-align: justify; }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #ccc; 
            text-align: center; 
            font-size: 10pt; 
            color: #666; 
          }
          @media print { 
            body { margin: 0; padding: 0; } 
            .no-print { display: none; } 
          }
          .print-instructions { 
            background: #f0f8ff; 
            border: 1px solid #0066cc; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-radius: 5px; 
            font-size: 11pt; 
          }
          .print-button { 
            background: #0066cc; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 12pt; 
            margin-right: 10px; 
          }
          .print-button:hover { background: #0052a3; }
        </style>
      </head>
      <body>
        <div class="print-instructions no-print">
          <strong>📄 Save as PDF Instructions:</strong><br>
          1. Click "Print" below or press Ctrl+P (Cmd+P on Mac)<br>
          2. Choose "Save as PDF" or "Microsoft Print to PDF" as your printer<br>
          3. Click "Save" to download your PDF<br><br>
          <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
          <button class="print-button" onclick="window.close()">❌ Close</button>
        </div>
        <div class="header">
          <h1 class="title">${title}</h1>
        </div>
        <div class="content">${content}</div>
        <div class="footer">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()
}

// Function to create application package
function createApplicationPackage(coverLetter: string, cvRecommendations: string): void {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Could not open print window. Please check your popup blocker settings.")
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Complete Application Package</title>
        <meta charset="utf-8">
        <style>
          @page { margin: 1in; size: A4; }
          body { 
            font-family: 'Times New Roman', serif; 
            font-size: 12pt; 
            line-height: 1.6; 
            color: #000; 
            max-width: 8.5in; 
            margin: 0 auto; 
            padding: 0; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 10px; 
          }
          .title { 
            font-size: 18pt; 
            font-weight: bold; 
            margin: 0; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
          }
          .section-title { 
            font-size: 16pt; 
            font-weight: bold; 
            margin: 40px 0 20px 0; 
            text-transform: uppercase; 
            border-bottom: 1px solid #000; 
            padding-bottom: 5px; 
          }
          .content { white-space: pre-wrap; text-align: justify; margin-bottom: 30px; }
          .page-break { page-break-before: always; }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #ccc; 
            text-align: center; 
            font-size: 10pt; 
            color: #666; 
          }
          @media print { 
            body { margin: 0; padding: 0; } 
            .no-print { display: none; } 
          }
          .print-instructions { 
            background: #f0f8ff; 
            border: 1px solid #0066cc; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-radius: 5px; 
            font-size: 11pt; 
          }
          .print-button { 
            background: #0066cc; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 12pt; 
            margin-right: 10px; 
          }
          .print-button:hover { background: #0052a3; }
        </style>
      </head>
      <body>
        <div class="print-instructions no-print">
          <strong>📄 Save Complete Package as PDF:</strong><br>
          1. Click "Print" below or press Ctrl+P (Cmd+P on Mac)<br>
          2. Choose "Save as PDF" or "Microsoft Print to PDF" as your printer<br>
          3. Click "Save" to download your complete application package<br><br>
          <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
          <button class="print-button" onclick="window.close()">❌ Close</button>
        </div>
        <div class="header">
          <h1 class="title">Complete Application Package</h1>
        </div>
        <h2 class="section-title">Cover Letter</h2>
        <div class="content">${coverLetter}</div>
        <div class="page-break"></div>
        <h2 class="section-title">CV Optimization Recommendations</h2>
        <div class="content">${cvRecommendations}</div>
        <div class="footer">
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()
}

// Export the functions
export { downloadTextFile as downloadAsFormattedText }
export { createPrintableWindow as openPrintableVersion }
export { createApplicationPackage as openApplicationPackagePrint }

// Legacy exports for compatibility
export const generatePdf = createPrintableWindow
export const generateApplicationPackagePdf = createApplicationPackage
export const generatePdfFromElement = (element: HTMLElement, filename: string) => {
  return Promise.resolve(createPrintableWindow(element.innerText, filename.replace(".pdf", "")))
}
