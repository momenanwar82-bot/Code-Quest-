
/**
 * خدمة الإعلانات الحقيقية
 * ملاحظة: يجب استبدال AD_UNIT_ID بمعرف الوحدة الإعلانية الخاص بك من حساب AdSense
 */

// Fix: Adding global declaration for googletag to resolve TypeScript errors on the window object.
declare global {
  interface Window {
    googletag: any;
  }
}

const AD_UNIT_ID = '/1234567/rewarded_ad_unit'; // مثال لمعرف وحدة إعلانية

export class AdService {
  private static isInitialized = false;

  static init() {
    if (typeof window === 'undefined' || !window.googletag) return;
    
    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(() => {
      // إعدادات الإعلان الحقيقي
      window.googletag.pubads().enableSingleRequest();
      window.googletag.enableServices();
      this.isInitialized = true;
    });
  }

  static async showRewardedAd(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isInitialized) {
        console.warn("Ad SDK not initialized. Using fallback.");
        // إذا لم يتم تحميل الإعلان، ننتظر قليلاً ثم نعطي مكافأة (مرحلة التطوير)
        setTimeout(() => resolve(true), 2000); 
        return;
      }

      window.googletag.cmd.push(() => {
        const rewardedSlot = window.googletag.defineOutOfPageSlot(
          AD_UNIT_ID,
          window.googletag.enums.OutOfPageFormat.REWARDED
        );

        if (rewardedSlot) {
          rewardedSlot.addService(window.googletag.pubads());
          
          window.googletag.pubads().addEventListener('rewardedSlotReady', (event: any) => {
            event.makeRewardedVisible();
          });

          window.googletag.pubads().addEventListener('rewardedSlotClosed', (event: any) => {
             // عند إغلاق الإعلان، نتحقق مما إذا كان المستخدم يستحق المكافأة
             resolve(true); 
             window.googletag.destroySlots([rewardedSlot]);
          });

          window.googletag.pubads().addEventListener('rewardedSlotGranted', (event: any) => {
            console.log('User earned reward!');
          });

          window.googletag.display(rewardedSlot);
        } else {
          resolve(false);
        }
      });
    });
  }
}
