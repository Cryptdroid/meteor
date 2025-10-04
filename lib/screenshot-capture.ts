/**
 * Screenshot and Canvas Capture Utilities
 * Handle        // Note: ignoreElements property not available in this version of html2canvas types
        // We'll handle element exclusion via CSS or pre-processing insteadulation results, maps, and 3D views as images
 */

export interface CaptureOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
  backgroundColor?: string;
  scale?: number;
  excludeElements?: string[];
}

export interface CaptureResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  format: string;
}

/**
 * Screenshot capture utility class
 */
export class ScreenshotCapture {
  private static readonly DEFAULT_OPTIONS: CaptureOptions = {
    width: 1200,
    height: 630, // Optimal for social media sharing
    quality: 0.9,
    format: 'png',
    backgroundColor: '#0B1121',
    scale: 2
  };

  /**
   * Capture a DOM element as an image
   */
  static async captureElement(
    element: HTMLElement,
    options: CaptureOptions = {}
  ): Promise<CaptureResult> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = await import('html2canvas');
      
      const canvas = await html2canvas.default(element, {
        width: config.width,
        height: config.height,
        // scale: config.scale, // Commented out as this property doesn't exist in Html2CanvasOptions
        background: config.backgroundColor,
        useCORS: true,
        allowTaint: true,
        logging: false,
        // removeContainer: true, // Commented out as this property doesn't exist in Html2CanvasOptions
        ignoreElements: (el: Element) => {
          // Exclude elements with data-exclude-from-capture attribute
          if (el.hasAttribute('data-exclude-from-capture')) {
            return true;
          }
          
          // Exclude specific CSS classes
          if (config.excludeElements) {
            return config.excludeElements.some(className => 
              el.classList.contains(className)
            );
          }
          
          return false;
        }
      });

      // Convert to blob
      const dataUrl = canvas.toDataURL(`image/${config.format}`, config.quality);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob!),
          `image/${config.format}`,
          config.quality
        );
      });

      return {
        dataUrl,
        blob,
        width: canvas.width,
        height: canvas.height,
        format: config.format!
      };
    } catch (error) {
      console.error('Failed to capture element:', error);
      throw new Error('Screenshot capture failed');
    }
  }

  /**
   * Capture Three.js canvas/WebGL context
   */
  static async captureCanvas(
    canvas: HTMLCanvasElement,
    options: CaptureOptions = {}
  ): Promise<CaptureResult> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Create a new canvas for processing
      const processCanvas = document.createElement('canvas');
      const ctx = processCanvas.getContext('2d')!;
      
      processCanvas.width = config.width!;
      processCanvas.height = config.height!;
      
      // Fill background
      if (config.backgroundColor) {
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, processCanvas.width, processCanvas.height);
      }
      
      // Draw the original canvas
      ctx.drawImage(canvas, 0, 0, processCanvas.width, processCanvas.height);
      
      // Convert to blob
      const dataUrl = processCanvas.toDataURL(`image/${config.format}`, config.quality);
      
      const blob = await new Promise<Blob>((resolve) => {
        processCanvas.toBlob(
          (blob) => resolve(blob!),
          `image/${config.format}`,
          config.quality
        );
      });

      return {
        dataUrl,
        blob,
        width: processCanvas.width,
        height: processCanvas.height,
        format: config.format!
      };
    } catch (error) {
      console.error('Failed to capture canvas:', error);
      throw new Error('Canvas capture failed');
    }
  }

  /**
   * Capture impact results visualization
   */
  static async captureImpactResults(elementId: string = 'impact-results'): Promise<CaptureResult> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    return this.captureElement(element, {
      width: 1200,
      height: 800,
      excludeElements: ['share-button', 'control-overlay']
    });
  }

  /**
   * Capture impact map visualization
   */
  static async captureImpactMap(elementId: string = 'impact-map'): Promise<CaptureResult> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    return this.captureElement(element, {
      width: 1200,
      height: 800,
      excludeElements: ['map-controls', 'zoom-controls']
    });
  }

  /**
   * Capture 3D orbital view
   */
  static async captureOrbitalView(containerId: string = 'orbital-view'): Promise<CaptureResult> {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with ID '${containerId}' not found`);
    }

    // Try to find the Three.js canvas
    const canvas = container.querySelector('canvas');
    if (canvas) {
      return this.captureCanvas(canvas, {
        width: 1200,
        height: 800
      });
    } else {
      // Fallback to capturing the entire container
      return this.captureElement(container, {
        width: 1200,
        height: 800,
        excludeElements: ['control-panel', 'info-panel']
      });
    }
  }

  /**
   * Capture threat radar visualization
   */
  static async captureThreatRadar(elementId: string = 'threat-radar'): Promise<CaptureResult> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    return this.captureElement(element, {
      width: 1200,
      height: 600,
      excludeElements: ['radar-controls']
    });
  }

  /**
   * Add watermark to captured image
   */
  static async addWatermark(
    captureResult: CaptureResult,
    watermarkText: string = 'asteroid-defense.app'
  ): Promise<CaptureResult> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = captureResult.width;
      canvas.height = captureResult.height;
      
      // Draw the original image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = captureResult.dataUrl;
      });
      
      ctx.drawImage(img, 0, 0);
      
      // Add watermark
      const fontSize = Math.max(16, canvas.width / 50);
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      
      const padding = 20;
      ctx.fillText(
        watermarkText,
        canvas.width - padding,
        canvas.height - padding
      );
      
      // Convert back to blob
      const dataUrl = canvas.toDataURL(`image/${captureResult.format}`, 0.9);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob!),
          `image/${captureResult.format}`,
          0.9
        );
      });

      return {
        ...captureResult,
        dataUrl,
        blob
      };
    } catch (error) {
      console.error('Failed to add watermark:', error);
      return captureResult; // Return original if watermark fails
    }
  }

  /**
   * Generate optimal image for social media platform
   */
  static async generateSocialImage(
    element: HTMLElement,
    platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' = 'twitter'
  ): Promise<CaptureResult> {
    const platformSizes = {
      twitter: { width: 1200, height: 675 },    // 16:9 ratio
      facebook: { width: 1200, height: 630 },   // 1.91:1 ratio
      linkedin: { width: 1200, height: 627 },   // 1.91:1 ratio
      instagram: { width: 1080, height: 1080 }  // 1:1 ratio
    };

    const size = platformSizes[platform];
    
    const capture = await this.captureElement(element, {
      width: size.width,
      height: size.height,
      quality: 0.9,
      format: 'jpeg' // Better compression for social media
    });

    // Add watermark
    return this.addWatermark(capture);
  }

  /**
   * Download captured image
   */
  static downloadImage(captureResult: CaptureResult, filename: string = 'asteroid-simulation') {
    const link = document.createElement('a');
    link.download = `${filename}.${captureResult.format}`;
    link.href = captureResult.dataUrl;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Upload image to temporary storage (for sharing)
   */
  static async uploadImageForSharing(captureResult: CaptureResult): Promise<string> {
    try {
      // This would typically upload to a service like Cloudinary, AWS S3, etc.
      // For now, we'll use a placeholder implementation
      
      const formData = new FormData();
      formData.append('image', captureResult.blob, `share-image.${captureResult.format}`);
      formData.append('type', 'simulation-share');
      
      const response = await fetch('/api/upload-share-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Fallback to data URL if upload fails
      return captureResult.dataUrl;
    }
  }
}

/**
 * Canvas utilities for 3D scene capture
 */
export class Canvas3DCapture {
  /**
   * Prepare Three.js canvas for capture
   */
  static prepareThreeJsCanvas(canvas: HTMLCanvasElement) {
    // Ensure the canvas is properly configured for capture
    const ctx = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (ctx) {
      // Force render to ensure latest frame is captured
      ctx.finish();
    }
  }

  /**
   * Capture high-quality 3D scene
   */
  static async captureHighQuality3D(
    canvas: HTMLCanvasElement,
    options: CaptureOptions = {}
  ): Promise<CaptureResult> {
    this.prepareThreeJsCanvas(canvas);
    
    // Wait a frame to ensure rendering is complete
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    return ScreenshotCapture.captureCanvas(canvas, {
      ...options,
      width: 1920,
      height: 1080,
      quality: 0.95
    });
  }
}