
/**
 * خدمة إعلانات كود كويست - Smart Ads
 * تستخدم Google Publisher Tag (GPT) لعرض إعلانات المكافأة والبانر
 */

declare global {
  interface Window {
    googletag: any;
  }
}

// المعرفات الحقيقية التي زودنا بها المستخدم
const AD_UNITS = {
  REVIVE: '/7576346303028960/1716656325', // إعلان مكافأة (ca-app-pub-7576346303028960/1716656325)
  BANNER: '/7576346303028960/4342819663'  // إعلان بانر (ca-app-pub-7576346303028960/4342819663)
};

export class AdService {
  private static isInitialized = false;

  static init() {
    if (typeof window === 'undefined') return;
    
    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(() => {
      window.googletag.pubads().enableSingleRequest();
      window.googletag.pubads().collapseEmptyDivs();
      window.googletag.enableServices();
      this.isInitialized = true;
      console.log("CodeQuest AdEngine initialized with custom units.");
    });
  }

  /**
   * عرض إعلان بانر في الحاوية المحددة
   */
  static displayBanner(containerId: string) {
    if (typeof window === 'undefined' || !window.googletag) return;

    window.googletag.cmd.push(() => {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = ''; // تنظيف أي محتوى سابق

      const slot = window.googletag.defineSlot(AD_UNITS.BANNER, [320, 50], containerId);
      if (slot) {
        slot.addService(window.googletag.pubads());
        window.googletag.display(containerId);
        window.googletag.pubads().refresh([slot]);
      }
    });
  }

  /**
   * عرض إعلان بمكافأة مع واجهة تحميل مخصصة
   */
  static async showRewardedAd(): Promise<boolean> {
    const loader = this.createOverlayLoader();
    document.body.appendChild(loader);

    return new Promise((resolve) => {
      if (!window.googletag) {
        console.warn("GPT not found. Simulation active.");
        this.runSimulation(loader, resolve);
        return;
      }

      window.googletag.cmd.push(() => {
        const rewardedSlot = window.googletag.defineOutOfPageSlot(
          AD_UNITS.REVIVE,
          window.googletag.enums.OutOfPageFormat.REWARDED
        );

        if (!rewardedSlot) {
          this.runSimulation(loader, resolve);
          return;
        }

        rewardedSlot.addService(window.googletag.pubads());

        // عندما يصبح الإعلان جاهزاً
        window.googletag.pubads().addEventListener('rewardedSlotReady', (event: any) => {
          if (loader.parentNode) document.body.removeChild(loader);
          event.makeRewardedVisible();
        });

        // متابعة المكافأة
        let rewardGranted = false;
        window.googletag.pubads().addEventListener('rewardedSlotGranted', () => {
          rewardGranted = true;
          console.log("Reward Status: GRANTED");
        });

        // عند الإغلاق
        window.googletag.pubads().addEventListener('rewardedSlotClosed', () => {
          window.googletag.destroySlots([rewardedSlot]);
          resolve(rewardGranted);
        });

        window.googletag.display(rewardedSlot);

        // مهلة أمان
        setTimeout(() => {
          if (loader.parentNode) {
            this.runSimulation(loader, resolve);
          }
        }, 8000);
      });
    });
  }

  private static createOverlayLoader(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'ad-loading-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(2, 6, 23, 0.98);
      z-index: 99999; display: flex; flex-direction: column;
      align-items: center; justify-content: center; font-family: 'Tajawal', sans-serif;
    `;
    overlay.innerHTML = `
      <div style="text-align: center; color: white;">
        <div style="font-size: 72px; margin-bottom: 24px; animation: pulse 2s infinite;">📺</div>
        <h2 style="font-size: 26px; font-weight: 900; margin-bottom: 12px;">جاري تجهيز المكافأة...</h2>
        <div style="margin: 20px auto; width: 140px; height: 4px; background: #1e293b; border-radius: 2px; overflow: hidden;">
          <div style="width: 100%; height: 100%; background: #3b82f6; animation: slide 1.2s infinite linear;"></div>
        </div>
        <p style="color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Connecting to Network</p>
      </div>
      <style>
        @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }
      </style>
    `;
    return overlay;
  }

  private static runSimulation(loader: HTMLDivElement, resolve: (v: boolean) => void) {
    const h2 = loader.querySelector('h2');
    if (h2) h2.innerText = "جاري عرض الإعلان التجريبي...";
    
    setTimeout(() => {
      if (loader.parentNode) document.body.removeChild(loader);
      resolve(true);
    }, 2500);
  }
}
