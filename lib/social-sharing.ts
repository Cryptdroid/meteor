/**
 * Social Sharing Utilities
 * Handles generation of shareable content and social media platform URLs
 */

export interface ShareData {
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
  imageUrl?: string;
  asteroidName?: string;
  impactEnergy?: number;
  craterDiameter?: number;
  affectedPopulation?: number;
  location?: string;
}

export interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  shareUrl: (data: ShareData) => string;
  maxTextLength?: number;
}

/**
 * Social media platform configurations
 */
export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    maxTextLength: 280,
    shareUrl: (data: ShareData) => {
      const text = encodeURIComponent(
        `${data.title}\n\n${data.description}${data.hashtags ? '\n\n' + data.hashtags.map(tag => `#${tag}`).join(' ') : ''}`
      );
      return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(data.url)}`;
    }
  },
  
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#4267B2',
    shareUrl: (data: ShareData) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title + ' - ' + data.description)}`;
    }
  },
  
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0077B5',
    shareUrl: (data: ShareData) => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}&summary=${encodeURIComponent(data.description)}`;
    }
  },
  
  reddit: {
    name: 'Reddit',
    icon: 'reddit',
    color: '#FF4500',
    shareUrl: (data: ShareData) => {
      return `https://reddit.com/submit?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}`;
    }
  },
  
  whatsapp: {
    name: 'WhatsApp',
    icon: 'message-circle',
    color: '#25D366',
    shareUrl: (data: ShareData) => {
      const text = encodeURIComponent(`${data.title}\n\n${data.description}\n\n${data.url}`);
      return `https://wa.me/?text=${text}`;
    }
  },
  
  telegram: {
    name: 'Telegram',
    icon: 'send',
    color: '#0088CC',
    shareUrl: (data: ShareData) => {
      return `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title + '\n\n' + data.description)}`;
    }
  }
};

/**
 * Content generators for different types of simulation results
 */
export class ShareContentGenerator {
  private static readonly BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://asteroid-defense.app';
  
  /**
   * Generate shareable content for asteroid impact simulation
   */
  static generateImpactShareContent(simulationResults: any, asteroidName: string): ShareData {
    const energy = simulationResults.energy?.megatonsTNT || 0;
    const craterDiameter = simulationResults.crater?.diameter || 0;
    const population = simulationResults.casualties?.affectedPopulation || 0;
    const location = simulationResults.impact?.location || 'Unknown Location';
    
    // Determine threat level
    let threatLevel = 'LOW';
    let threatEmoji = '🟢';
    let urgencyText = 'manageable threat';
    
    if (energy > 100) {
      threatLevel = 'EXTREME';
      threatEmoji = '🔴';
      urgencyText = 'civilization-ending catastrophe';
    } else if (energy > 10) {
      threatLevel = 'HIGH';
      threatEmoji = '🟠';
      urgencyText = 'regional devastation';
    } else if (energy > 1) {
      threatLevel = 'MODERATE';
      threatEmoji = '🟡';
      urgencyText = 'significant impact event';
    }
    
    const title = `${threatEmoji} ASTEROID IMPACT SIMULATION: ${asteroidName}`;
    
    const description = `Just simulated a potential asteroid impact scenario!\n\n` +
      `📊 Impact Energy: ${energy.toFixed(1)} Megatons TNT\n` +
      `🕳️ Crater Diameter: ${(craterDiameter / 1000).toFixed(1)} km\n` +
      `👥 Affected Population: ${population > 1000000 ? (population / 1000000).toFixed(1) + 'M' : population.toLocaleString()}\n` +
      `📍 Location: ${location}\n\n` +
      `Threat Level: ${threatLevel} - This would be a ${urgencyText}.\n\n` +
      `Try the asteroid defense simulator yourself!`;
    
    return {
      title,
      description,
      url: `${this.BASE_URL}/dashboard?shared=impact&asteroid=${encodeURIComponent(asteroidName)}`,
      hashtags: ['AsteroidDefense', 'SpaceScience', 'PlanetaryDefense', 'NASA', 'Asteroid', threatLevel.toLowerCase()],
      asteroidName,
      impactEnergy: energy,
      craterDiameter,
      affectedPopulation: population,
      location
    };
  }
  
  /**
   * Generate shareable content for orbital trajectory visualization
   */
  static generateOrbitShareContent(asteroid: any): ShareData {
    const diameter = (asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0) * 1000;
    const velocity = parseFloat(asteroid.close_approach_data[0]?.relative_velocity?.kilometers_per_second || '20');
    const distance = parseFloat(asteroid.close_approach_data[0]?.miss_distance?.kilometers || '1000000');
    const isHazardous = asteroid.is_potentially_hazardous_asteroid;
    
    const title = `🚀 3D ORBITAL VISUALIZATION: ${asteroid.name}`;
    
    const description = `Exploring the orbital mechanics of near-Earth asteroid ${asteroid.name}!\n\n` +
      `⭕ Diameter: ${diameter.toFixed(0)} meters\n` +
      `⚡ Velocity: ${velocity.toFixed(1)} km/s\n` +
      `📏 Distance: ${(distance / 1000000).toFixed(2)} million km\n` +
      `⚠️ Hazard Status: ${isHazardous ? 'POTENTIALLY HAZARDOUS' : 'Safe'}\n\n` +
      `Check out this realistic 3D orbital simulation with accurate Kepler mechanics!\n\n` +
      `Explore space science with our asteroid defense simulator.`;
    
    return {
      title,
      description,
      url: `${this.BASE_URL}/dashboard?shared=orbit&asteroid=${encodeURIComponent(asteroid.name)}`,
      hashtags: ['3DVisualization', 'OrbitalMechanics', 'Asteroid', 'SpaceExploration', 'KeplerLaws', 'NASA'],
      asteroidName: asteroid.name
    };
  }
  
  /**
   * Generate shareable content for threat radar detection
   */
  static generateThreatRadarContent(topThreats: any[]): ShareData {
    const threatCount = topThreats.length;
    const highestThreat = topThreats[0];
    
    const title = `🔴 SPACE THREAT RADAR: ${threatCount} Asteroids Detected`;
    
    const description = `Just scanned the solar system for incoming asteroid threats!\n\n` +
      `🎯 Detected Objects: ${threatCount}\n` +
      `⚠️ Highest Threat: ${highestThreat?.name || 'Unknown'}\n` +
      `📡 Real-time NASA data integration\n` +
      `🛡️ Advanced threat assessment algorithms\n\n` +
      `Stay informed about near-Earth objects and planetary defense!\n\n` +
      `Try our asteroid threat detection system.`;
    
    return {
      title,
      description,
      url: `${this.BASE_URL}/dashboard?shared=radar`,
      hashtags: ['ThreatDetection', 'PlanetaryDefense', 'NASA', 'SpaceSafety', 'NEO', 'AsteroidWatch']
    };
  }
  
  /**
   * Generate general app sharing content
   */
  static generateAppShareContent(): ShareData {
    const title = '🛡️ ASTEROID DEFENSE SIMULATOR';
    
    const description = `Explore the fascinating world of planetary defense!\n\n` +
      `🔬 Real NASA asteroid data\n` +
      `🌍 Impact simulation technology\n` +
      `🚀 3D orbital mechanics visualization\n` +
      `📊 Advanced threat assessment\n` +
      `🎮 Interactive space science\n\n` +
      `Discover what it takes to protect Earth from asteroid impacts!\n\n` +
      `Try the ultimate asteroid defense experience.`;
    
    return {
      title,
      description,
      url: this.BASE_URL,
      hashtags: ['AsteroidDefense', 'SpaceScience', 'NASA', 'PlanetaryDefense', 'Education', 'InteractiveScience']
    };
  }
}

/**
 * Utility functions for social sharing
 */
export class SocialSharingUtils {
  /**
   * Open social sharing popup window
   */
  static openShareWindow(url: string, platform: string, width = 600, height = 400) {
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    // Focus on the popup window
    if (popup) {
      popup.focus();
    }
    
    return popup;
  }
  
  /**
   * Copy share URL to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  
  /**
   * Generate a shareable image URL (placeholder for future implementation)
   */
  static generateImageUrl(componentId: string, type: 'impact' | 'orbit' | 'radar'): string {
    // This would be implemented with canvas/screenshot functionality
    return `${ShareContentGenerator['BASE_URL']}/api/share-image?component=${componentId}&type=${type}`;
  }
  
  /**
   * Validate and sanitize share data
   */
  static sanitizeShareData(data: ShareData): ShareData {
    return {
      ...data,
      title: data.title.substring(0, 200),
      description: data.description.substring(0, 500),
      hashtags: data.hashtags?.slice(0, 10) || []
    };
  }
  
  /**
   * Check if Web Share API is available
   */
  static isNativeShareAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }
  
  /**
   * Use native Web Share API if available
   */
  static async nativeShare(data: ShareData): Promise<boolean> {
    if (!this.isNativeShareAvailable()) {
      return false;
    }
    
    try {
      await navigator.share({
        title: data.title,
        text: data.description,
        url: data.url
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred
      return false;
    }
  }
  
  /**
   * Generate share statistics for analytics
   */
  static trackShare(platform: string, contentType: string, asteroidName?: string) {
    // This would integrate with analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: contentType,
        content_id: asteroidName || 'general'
      });
    }
  }
}