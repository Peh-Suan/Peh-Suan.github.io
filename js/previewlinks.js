(function () {
  const OFFSET_X = 15;
  const OFFSET_Y = 15;
  const PAD = 20;

  // Initialize PDF.js worker
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  }

  function placeAt(preview, clientX, clientY) {
    const pv = preview.getBoundingClientRect();
    let left = clientX + OFFSET_X;
    let top  = clientY + OFFSET_Y;

    if (left + pv.width > window.innerWidth - PAD) left = clientX - pv.width - OFFSET_X;
    if (top + pv.height > window.innerHeight - PAD) top = clientY - pv.height - OFFSET_Y;

    left = Math.max(PAD, Math.min(left, window.innerWidth - pv.width - PAD));
    top = Math.max(PAD, Math.min(top, window.innerHeight - pv.height - PAD));

    preview.style.left = left + "px";
    preview.style.top  = top + "px";
  }

  // Function to generate a thumbnail from a PDF using PDF.js
  async function generatePDFThumbnail(pdfUrl, imgElement) {
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1); // Get the first page
      
      // Scale it down so it processes quickly and fits the popup
      const viewport = page.getViewport({ scale: 0.5 }); 
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      
      // Convert the canvas to an image and apply it to our popup
      imgElement.src = canvas.toDataURL('image/jpeg');
      imgElement.className = "lp-image";
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("a.preview-link").forEach(anchor => {
      const targetUrl = anchor.href;
      
      const preview = document.createElement("span");
      preview.className = "link-preview";
      preview.setAttribute("role", "tooltip");

      const urlObj = new URL(targetUrl);
      const hostname = urlObj.hostname;
      const titleText = anchor.textContent || "Link";
      const descText = anchor.getAttribute("data-desc");

    //   let innerHTML = `<span class="lp-title">${titleText}</span>`;
    //   if (descText) {
    //     innerHTML += `<span class="lp-desc">${descText}</span>`;
    //   }
      let innerHTML = ``
      // Only show the URL at the bottom if it's not a local file
      if (hostname && hostname !== window.location.hostname) {
        innerHTML += `<span class="lp-url">${hostname}</span>`;
      } else if (targetUrl.toLowerCase().endsWith('.pdf')) {
        innerHTML += `<span class="lp-url">PDF Document</span>`;
      }
      
      preview.innerHTML = innerHTML;
      document.body.appendChild(preview);

      // --- THE PRELOAD UPDATE ---
      // We start the download immediately in the background, no waiting for window.load
      
      const customImgUrl = anchor.getAttribute("data-image");
      const isPdf = targetUrl.toLowerCase().endsWith('.pdf');
      const preloadedImg = new Image();

      if (customImgUrl) {
        // 1. Manual Override (Great for your own github pages)
        preloadedImg.src = customImgUrl;
        preloadedImg.onload = () => {
          preloadedImg.className = "lp-image";
          preview.insertBefore(preloadedImg, preview.firstChild);
        };
      } else if (isPdf) {
        // 2. Automated PDF Snapshot
        generatePDFThumbnail(targetUrl, preloadedImg).then(() => {
          preview.insertBefore(preloadedImg, preview.firstChild);
        });
      } else {
        // 3. Automated Website Snapshot via Thum.io
        const thumbnailUrl = `https://image.thum.io/get/width/320/crop/600/${targetUrl}`;
        preloadedImg.src = thumbnailUrl;
        preloadedImg.onload = () => {
          preloadedImg.className = "lp-image";
          preview.insertBefore(preloadedImg, preview.firstChild);
        };
      }
      // ---------------------------

      anchor.addEventListener("mouseenter", (e) => {
        preview.classList.add("show-preview");
        placeAt(preview, e.clientX, e.clientY);
      });

      anchor.addEventListener("mousemove", (e) => {
        if (preview.classList.contains("show-preview")) {
          requestAnimationFrame(() => placeAt(preview, e.clientX, e.clientY));
        }
      });

      anchor.addEventListener("mouseleave", () => {
        preview.classList.remove("show-preview");
      });

      anchor.addEventListener("focus", () => {
        preview.classList.add("show-preview");
        const rect = anchor.getBoundingClientRect();
        placeAt(preview, rect.left, rect.bottom);
      });
      
      anchor.addEventListener("blur", () => {
        preview.classList.remove("show-preview");
      });
    });
  });
})();