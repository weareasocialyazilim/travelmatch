/**
 * PayTR WebView Screen
 *
 * Displays PayTR iFrame for secure payment processing.
 * This screen is opened after payment intent is created.
 *
 * Flow:
 * 1. UnifiedGiftFlow creates payment intent → gets iframeToken
 * 2. Navigate here with iframeToken
 * 3. User completes payment in PayTR iFrame
 * 4. WebView intercepts success/failure redirect
 * 5. Navigate to Success or PaymentFailed screen
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';
import { COLORS } from '@/constants/colors';
import { useScreenSecurity } from '@/hooks/useScreenSecurity';
import { useAnalytics } from '@/hooks/useAnalytics';
import { showAlert } from '@/stores/modalStore';

// PayTR iFrame URLs
const PAYTR_IFRAME_URL = 'https://www.paytr.com/odeme/guvenli';
const PAYTR_SANDBOX_URL = 'https://sandbox-paytr.com/odeme/guvenli';

// Success/Failure redirect patterns
const SUCCESS_PATTERNS = [
  '/odeme/basarili',
  '/payment/success',
  'status=success',
  'result=ok',
];

const FAILURE_PATTERNS = [
  '/odeme/basarisiz',
  '/payment/failed',
  'status=failed',
  'result=error',
];

type PayTRWebViewScreenProps = StackScreenProps<
  RootStackParamList,
  'PayTRWebView'
>;

export const PayTRWebViewScreen: React.FC<PayTRWebViewScreenProps> = ({
  route,
  navigation,
}) => {
  const {
    iframeToken,
    merchantOid,
    amount,
    currency,
    giftId: _giftId,
    isTestMode,
  } = route.params;

  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Security: Prevent screenshots during payment
  useScreenSecurity();

  const { trackEvent } = useAnalytics();

  // Track screen view
  useEffect(() => {
    trackEvent('paytr_webview_opened', {
      merchantOid,
      amount,
      currency,
      isTestMode,
    });
  }, [trackEvent, merchantOid, amount, currency, isTestMode]);

  // Handle back button
  useEffect(() => {
    const handleBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }

      // Show confirmation before closing payment
      showAlert({
        title: 'Ödemeyi İptal Et',
        message: 'Ödeme işleminden çıkmak istediğinizden emin misiniz?',
        buttons: [
          { text: 'Hayır', style: 'cancel' },
          {
            text: 'Evet, İptal Et',
            style: 'destructive',
            onPress: () => {
              trackEvent('paytr_payment_cancelled', { merchantOid });
              navigation.navigate('PaymentFailed', {
                transactionId: merchantOid,
                error: 'Ödeme iptal edildi',
              });
            },
          },
        ],
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [canGoBack, merchantOid, navigation, trackEvent]);

  // Build PayTR iFrame URL
  const paytrUrl = `${isTestMode ? PAYTR_SANDBOX_URL : PAYTR_IFRAME_URL}/${iframeToken}`;

  // Handle navigation state changes
  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      setCanGoBack(navState.canGoBack);

      const currentUrl = navState.url.toLowerCase();

      // Check for success
      const isSuccess = SUCCESS_PATTERNS.some((pattern) =>
        currentUrl.includes(pattern),
      );
      if (isSuccess) {
        trackEvent('paytr_payment_success', { merchantOid, amount });
        navigation.replace('Success', {
          type: 'gift_sent',
          title: 'Ödeme Başarılı!',
          subtitle: 'Hediyeniz başarıyla gönderildi.',
          details: {
            amount,
            referenceId: merchantOid,
          },
        });
        return;
      }

      // Check for failure
      const isFailure = FAILURE_PATTERNS.some((pattern) =>
        currentUrl.includes(pattern),
      );
      if (isFailure) {
        trackEvent('paytr_payment_failed', { merchantOid });
        navigation.replace('PaymentFailed', {
          transactionId: merchantOid,
          error: 'Ödeme işlemi başarısız oldu',
        });
        return;
      }
    },
    [merchantOid, amount, navigation, trackEvent],
  );

  // Handle WebView messages from injected JS
  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === 'paytr_result') {
          if (data.status === 'success') {
            trackEvent('paytr_payment_success_message', { merchantOid });
            navigation.replace('Success', {
              type: 'gift_sent',
              title: 'Ödeme Başarılı!',
              subtitle: 'Hediyeniz başarıyla gönderildi.',
              details: {
                amount,
                referenceId: merchantOid,
              },
            });
          } else {
            trackEvent('paytr_payment_failed_message', {
              merchantOid,
              reason: data.reason,
            });
            navigation.replace('PaymentFailed', {
              transactionId: merchantOid,
              error: data.reason || 'Ödeme işlemi başarısız oldu',
            });
          }
        }
      } catch {
        // Not a JSON message, ignore
      }
    },
    [merchantOid, amount, navigation, trackEvent],
  );

  // Handle load errors
  const handleError = useCallback(
    (syntheticEvent: { nativeEvent: { description: string } }) => {
      const { description } = syntheticEvent.nativeEvent;
      setLoadError(description);
      trackEvent('paytr_webview_error', { merchantOid, error: description });
    },
    [merchantOid, trackEvent],
  );

  // Handle close button
  const handleClose = useCallback(() => {
    showAlert({
      title: 'Ödemeyi İptal Et',
      message: 'Ödeme işleminden çıkmak istediğinizden emin misiniz?',
      buttons: [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: () => {
            trackEvent('paytr_payment_cancelled', { merchantOid });
            navigation.goBack();
          },
        },
      ],
    });
  }, [merchantOid, navigation, trackEvent]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setLoadError(null);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  // Injected JavaScript to capture payment result
  const injectedJavaScript = `
    (function() {
      // Listen for PayTR result messages
      window.addEventListener('message', function(event) {
        if (event.data && typeof event.data === 'object') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'paytr_result',
            ...event.data
          }));
        }
      });

      // Check if on success/failure page
      function checkResult() {
        const url = window.location.href.toLowerCase();
        if (url.includes('basarili') || url.includes('success')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'paytr_result',
            status: 'success'
          }));
        } else if (url.includes('basarisiz') || url.includes('failed')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'paytr_result',
            status: 'failed',
            reason: document.body.innerText.slice(0, 200)
          }));
        }
      }

      // Check on load and URL changes
      checkResult();

      const observer = new MutationObserver(checkResult);
      observer.observe(document.body, { childList: true, subtree: true });

      true;
    })();
  `;

  // Error state
  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ödeme</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={COLORS.feedback.error} />
          <Text style={styles.errorTitle}>Bağlantı Hatası</Text>
          <Text style={styles.errorMessage}>
            Ödeme sayfası yüklenemedi. Lütfen internet bağlantınızı kontrol edip
            tekrar deneyin.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Icon name="refresh" size={20} color={COLORS.utility.white} />
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Icon name="lock" size={16} color={COLORS.feedback.success} />
          <Text style={styles.headerTitle}>Güvenli Ödeme</Text>
        </View>
        <View style={styles.headerRight}>
          {isTestMode && (
            <View style={styles.testBadge}>
              <Text style={styles.testBadgeText}>TEST</Text>
            </View>
          )}
        </View>
      </View>

      {/* Amount Display */}
      <View style={styles.amountBar}>
        <Text style={styles.amountLabel}>Ödenecek Tutar</Text>
        <Text style={styles.amountValue}>
          {currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : '$'}
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: paytrUrl }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          onError={handleError}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          // Note: domStorageEnabled needed for PayTR session management
          domStorageEnabled={true}
          // Security: Disable third-party cookies for payment security
          thirdPartyCookiesEnabled={false}
          sharedCookiesEnabled={false}
          // Security: Restrict to trusted PayTR domains only
          originWhitelist={[
            'https://www.paytr.com',
            'https://sandbox-paytr.com',
            'https://*.paytr.com',
          ]}
          // Security: Never allow mixed content in payment context
          mixedContentMode="never"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.brand.primary} />
              <Text style={styles.loadingText}>
                Güvenli ödeme sayfası yükleniyor...
              </Text>
            </View>
          )}
          // Security settings
          incognito={false}
          cacheEnabled={true}
          // SSL pinning would require native module
        />

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.brand.primary} />
            <Text style={styles.loadingText}>
              Güvenli ödeme sayfası yükleniyor...
            </Text>
          </View>
        )}
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Icon name="shield-check" size={16} color={COLORS.feedback.success} />
        <Text style={styles.securityText}>
          256-bit SSL ile korunan güvenli ödeme
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.utility.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  testBadge: {
    backgroundColor: COLORS.feedback.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
  amountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.utility.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    backgroundColor: COLORS.bg.secondary,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});

export default PayTRWebViewScreen;
