class ImageViewer {
  constructor() {
    this.setupViewer();
    this.setupEventListeners();
    this.currentScale = 1;
    this.isDragging = false;
    this.startPos = { x: 0, y: 0 };
    this.currentPos = { x: 0, y: 0 };
  }

  setupViewer() {
    // Create viewer elements
    const overlay = document.createElement('div');
    overlay.className = 'image-viewer-overlay';
    overlay.innerHTML = `
      <div class="image-viewer-container">
        <button class="image-viewer-close">&times;</button>
        <div class="image-viewer-content">
          <img class="image-viewer-img" src="" alt="Preview">
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Store references
    this.overlay = overlay;
    this.container = overlay.querySelector('.image-viewer-container');
    this.content = overlay.querySelector('.image-viewer-content');
    this.img = overlay.querySelector('.image-viewer-img');
    this.closeBtn = overlay.querySelector('.image-viewer-close');
  }

  setupEventListeners() {
    // Make all images clickable
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG' && !e.target.classList.contains('image-viewer-img')) {
        this.openImage(e.target.src);
      }
    });

    // Close button
    this.closeBtn.addEventListener('click', () => this.closeViewer());

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.closeViewer();
      }
    });

    // Zoom handling
    this.img.addEventListener('click', (e) => {
      if (this.currentScale === 1) {
        this.zoomIn(e);
      } else {
        this.resetZoom();
      }
    });

    // Drag handling
    this.img.addEventListener('mousedown', (e) => {
      if (this.currentScale > 1) {
        this.startDrag(e);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.currentScale > 1) {
        this.drag(e);
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Prevent zoom on mobile double tap
    this.img.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        if (this.currentScale === 1) {
          this.zoomIn(e.touches[0]);
        } else {
          this.resetZoom();
        }
      }
      e.preventDefault();
    }, { passive: false });

    // Handle keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
        this.closeViewer();
      }
    });

    // Mouse wheel zoom
    this.overlay.addEventListener('wheel', (e) => {
      if (this.overlay.classList.contains('active')) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(1, this.currentScale + delta), 5);
        
        if (newScale !== this.currentScale) {
          const rect = this.img.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          this.zoomToPoint(newScale, x, y);
        }
      }
    }, { passive: false });
  }

  openImage(src) {
    this.img.src = src;
    this.overlay.classList.add('active');
    document.body.classList.add('image-viewer-open');
    this.resetZoom();
  }

  closeViewer() {
    this.overlay.classList.remove('active');
    document.body.classList.remove('image-viewer-open');
    this.resetZoom();
  }

  zoomIn(e) {
    const rect = this.img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.zoomToPoint(3, x, y);
  }

  zoomToPoint(scale, x, y) {
    this.currentScale = scale;
    const xPercent = x / this.img.width;
    const yPercent = y / this.img.height;
    
    this.img.style.transform = `scale(${scale})`;
    this.img.style.transformOrigin = `${xPercent * 100}% ${yPercent * 100}%`;
    this.img.classList.toggle('zoomed', scale > 1);
  }

  resetZoom() {
    this.currentScale = 1;
    this.img.style.transform = '';
    this.img.style.transformOrigin = 'center';
    this.img.classList.remove('zoomed');
    this.currentPos = { x: 0, y: 0 };
  }

  startDrag(e) {
    this.isDragging = true;
    this.startPos = {
      x: e.clientX - this.currentPos.x,
      y: e.clientY - this.currentPos.y
    };
  }

  drag(e) {
    if (!this.isDragging) return;

    this.currentPos = {
      x: e.clientX - this.startPos.x,
      y: e.clientY - this.startPos.y
    };

    const maxX = (this.img.width * this.currentScale - this.img.width) / 2;
    const maxY = (this.img.height * this.currentScale - this.img.height) / 2;

    this.currentPos.x = Math.min(Math.max(this.currentPos.x, -maxX), maxX);
    this.currentPos.y = Math.min(Math.max(this.currentPos.y, -maxY), maxY);

    this.img.style.transform = `scale(${this.currentScale}) translate(${this.currentPos.x}px, ${this.currentPos.y}px)`;
  }
}

// Initialize the image viewer
const imageViewer = new ImageViewer();
