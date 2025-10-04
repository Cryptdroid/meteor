'use client';

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Send, 
  Copy, 
  Download, 
  X,
  Camera,
  Loader2,
  CheckCircle,
  ExternalLink,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  SOCIAL_PLATFORMS, 
  ShareContentGenerator, 
  SocialSharingUtils,
  type ShareData 
} from '@/lib/social-sharing';
import { ScreenshotCapture, type CaptureResult } from '@/lib/screenshot-capture';

interface SocialShareButtonProps {
  shareData: ShareData;
  platform: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';
  onShare?: (platform: string) => void;
}

export function SocialShareButton({ 
  shareData, 
  platform, 
  size = 'md', 
  variant = 'icon',
  onShare 
}: SocialShareButtonProps) {
  const platformConfig = SOCIAL_PLATFORMS[platform];
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (!platformConfig) return;
    
    setIsSharing(true);
    
    try {
      const shareUrl = platformConfig.shareUrl(shareData);
      
      // Track the share event
      SocialSharingUtils.trackShare(platform, 'simulation', shareData.asteroidName);
      
      // Open share window
      SocialSharingUtils.openShareWindow(shareUrl, platform);
      
      onShare?.(platform);
    } catch (error) {
      console.error(`Failed to share on ${platform}:`, error);
    } finally {
      setIsSharing(false);
    }
  }, [shareData, platform, platformConfig, onShare]);

  const getIcon = () => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'telegram': return <Send className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
    <Button
      variant="outline"
      size={buttonSize}
      onClick={handleShare}
      disabled={isSharing}
      className={`
        transition-all duration-200 hover:scale-105
        ${variant === 'icon' ? 'p-2' : 'gap-2'}
      `}
      style={{
        borderColor: platformConfig?.color,
        color: platformConfig?.color
      }}
    >
      {isSharing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        getIcon()
      )}
      {variant === 'full' && !isSharing && (
        <span>{platformConfig?.name}</span>
      )}
    </Button>
  );
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
  captureElement?: () => Promise<CaptureResult>;
  title?: string;
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  shareData, 
  captureElement,
  title = 'Share Simulation Results'
}: ShareModalProps) {
  const [customMessage, setCustomMessage] = useState(shareData.description);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCapture = useCallback(async () => {
    if (!captureElement) return;
    
    setIsCapturing(true);
    try {
      const result = await captureElement();
      setCaptureResult(result);
    } catch (error) {
      console.error('Failed to capture:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [captureElement]);

  const handleCopyLink = useCallback(async () => {
    const success = await SocialSharingUtils.copyToClipboard(shareData.url);
    setCopySuccess(success);
    
    if (success) {
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [shareData.url]);

  const handleNativeShare = useCallback(async () => {
    const success = await SocialSharingUtils.nativeShare({
      ...shareData,
      description: customMessage
    });
    
    if (success) {
      onClose();
    }
  }, [shareData, customMessage, onClose]);

  const handleDownload = useCallback(() => {
    if (captureResult) {
      ScreenshotCapture.downloadImage(
        captureResult, 
        `asteroid-simulation-${Date.now()}`
      );
    }
  }, [captureResult]);

  const updatedShareData = {
    ...shareData,
    description: customMessage
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.9)' 
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card variant="glass" className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-cyber-400">
                    <Share2 className="w-5 h-5" />
                    {title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Preview */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Preview</h4>
                  <div className="p-4 rounded-lg bg-stellar-surface/20 border border-stellar-surface/30">
                    <div className="font-semibold text-cyber-400 mb-2">
                      {shareData.title}
                    </div>
                    <div className="text-sm text-stellar-light/70 whitespace-pre-line">
                      {customMessage}
                    </div>
                    {shareData.hashtags && shareData.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {shareData.hashtags.map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-matrix-500/20 text-matrix-400 flex items-center gap-1"
                          >
                            <Hash className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Message */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Customize Message</h4>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full h-32 p-3 rounded-lg bg-stellar-surface/20 border border-stellar-surface/30 text-white placeholder-stellar-light/50 resize-none focus:outline-none focus:ring-2 focus:ring-cyber-400/50"
                    placeholder="Add your own message..."
                  />
                  <div className="text-xs text-stellar-light/60">
                    {customMessage.length}/500 characters
                  </div>
                </div>

                {/* Capture Options */}
                {captureElement && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Include Image</h4>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={handleCapture}
                        disabled={isCapturing}
                        className="gap-2"
                      >
                        {isCapturing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                        {isCapturing ? 'Capturing...' : 'Capture Screenshot'}
                      </Button>
                      
                      {captureResult && (
                        <Button
                          variant="outline"
                          onClick={handleDownload}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      )}
                    </div>
                    
                    {captureResult && (
                      <div className="p-3 rounded-lg bg-stellar-surface/20 border border-stellar-surface/30">
                        <img
                          src={captureResult.dataUrl}
                          alt="Captured screenshot"
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="text-xs text-stellar-light/60 mt-2">
                          {captureResult.width} × {captureResult.height} • {captureResult.format.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Social Platforms */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Share On</h4>
                  
                  {/* Native Share (if available) */}
                  {SocialSharingUtils.isNativeShareAvailable() && (
                    <Button
                      onClick={handleNativeShare}
                      className="w-full gap-2 mb-3"
                    >
                      <Share2 className="w-4 h-4" />
                      Share via System
                    </Button>
                  )}
                  
                  {/* Social Platform Buttons */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {Object.keys(SOCIAL_PLATFORMS).map((platform) => (
                      <SocialShareButton
                        key={platform}
                        shareData={updatedShareData}
                        platform={platform}
                        variant="full"
                        size="sm"
                        onShare={() => {
                          // Close modal after sharing
                          setTimeout(onClose, 1000);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Copy Link */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Direct Link</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 rounded-lg bg-stellar-surface/20 border border-stellar-surface/30 text-sm text-stellar-light/70 font-mono truncate">
                      {shareData.url}
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="gap-2 shrink-0"
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-status-normal" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Use portal to render at document body level
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}

interface QuickShareButtonProps {
  type: 'impact' | 'orbit' | 'radar' | 'general';
  data?: any;
  elementId?: string;
  className?: string;
}

export function QuickShareButton({ 
  type, 
  data, 
  elementId,
  className = ''
}: QuickShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  const generateShareData = useCallback(() => {
    switch (type) {
      case 'impact':
        return ShareContentGenerator.generateImpactShareContent(
          data.simulationResults, 
          data.asteroidName
        );
      case 'orbit':
        return ShareContentGenerator.generateOrbitShareContent(data);
      case 'radar':
        return ShareContentGenerator.generateThreatRadarContent(data);
      case 'general':
      default:
        return ShareContentGenerator.generateAppShareContent();
    }
  }, [type, data]);

  const handleCaptureElement = useCallback(async (): Promise<CaptureResult> => {
    if (!elementId) {
      throw new Error('No element ID provided for capture');
    }
    
    switch (type) {
      case 'impact':
        return ScreenshotCapture.captureImpactResults(elementId);
      case 'orbit':
        return ScreenshotCapture.captureOrbitalView(elementId);
      case 'radar':
        return ScreenshotCapture.captureThreatRadar(elementId);
      default:
        const element = document.getElementById(elementId);
        if (!element) throw new Error('Element not found');
        return ScreenshotCapture.captureElement(element);
    }
  }, [type, elementId]);

  const handleShareClick = useCallback(() => {
    console.log('Share button clicked!');
    const data = generateShareData();
    console.log('Share data:', data);
    setShareData(data);
    setIsModalOpen(true);
    console.log('Modal should be open now');
  }, [generateShareData]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareClick}
        className={`gap-2 ${className}`}
        data-exclude-from-capture="true"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      {shareData && (
        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          shareData={shareData}
          captureElement={elementId ? handleCaptureElement : undefined}
        />
      )}
    </>
  );
}

interface SocialShareBarProps {
  shareData: ShareData;
  platforms?: string[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function SocialShareBar({ 
  shareData, 
  platforms = ['twitter', 'facebook', 'linkedin', 'whatsapp'],
  orientation = 'horizontal',
  className = ''
}: SocialShareBarProps) {
  return (
    <div className={`
      flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'} 
      items-center gap-2 ${className}
    `}>
      {platforms.map((platform) => (
        <SocialShareButton
          key={platform}
          shareData={shareData}
          platform={platform}
          size="sm"
        />
      ))}
    </div>
  );
}