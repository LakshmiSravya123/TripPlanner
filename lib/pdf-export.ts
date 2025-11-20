// PDF export utility using browser's print functionality
export function exportToPDF(content: HTMLElement | string, filename: string = 'trip-itinerary.pdf') {
  return new Promise<void>((resolve, reject) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        reject(new Error('Popup blocked. Please allow popups to export PDF.'));
        return;
      }

      // Get the content
      let htmlContent = '';
      if (typeof content === 'string') {
        htmlContent = content;
      } else {
        htmlContent = content.innerHTML;
      }

      // Write the content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <style>
              @media print {
                @page {
                  margin: 1cm;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                h1, h2, h3 {
                  color: #8b5cf6;
                  margin-top: 1.5em;
                  margin-bottom: 0.5em;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1em 0;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f3f4f6;
                }
                .iframe-container {
                  page-break-inside: avoid;
                  margin: 1em 0;
                }
                iframe {
                  width: 100%;
                  height: 400px;
                  border: 1px solid #ddd;
                }
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Close the window after printing
          setTimeout(() => {
            printWindow.close();
            resolve();
          }, 1000);
        }, 500);
      };
    } catch (error) {
      reject(error);
    }
  });
}

