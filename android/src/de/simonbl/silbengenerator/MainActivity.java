package de.simonbl.silbengenerator;

import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/** Offline shell. Every page and resource is read directly from the APK. */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/silbengenerator/index.html";
    private FrameLayout container;
    private WebView webView;
    private View fullscreenView;
    private WebChromeClient.CustomViewCallback fullscreenCallback;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        container = new FrameLayout(this);
        container.setBackgroundColor(Color.rgb(247, 245, 238));
        container.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View view, WindowInsets insets) {
                boolean full = fullscreenView != null;
                view.setPadding(full ? 0 : insets.getSystemWindowInsetLeft(),
                    full ? 0 : insets.getSystemWindowInsetTop(),
                    full ? 0 : insets.getSystemWindowInsetRight(),
                    full ? 0 : insets.getSystemWindowInsetBottom());
                return insets.consumeSystemWindowInsets();
            }
        });
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(247, 245, 238));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBlockNetworkLoads(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        CookieManager.getInstance().setAcceptCookie(false);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetResponse(request.getUrl(), request.getMethod());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isLocal(request.getUrl());
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (fullscreenView != null) {
                    callback.onCustomViewHidden();
                    return;
                }
                fullscreenView = view;
                fullscreenCallback = callback;
                webView.setVisibility(View.GONE);
                container.addView(view, new FrameLayout.LayoutParams(-1, -1));
                setFullscreen(true);
            }

            @Override
            public void onHideCustomView() {
                leaveFullscreen();
            }
        });
        container.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(container);
        webView.loadUrl(START_URL);
    }

    private static boolean isLocal(Uri uri) {
        String path = uri.getPath();
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost())
            && (uri.getPort() == -1 || uri.getPort() == 443)
            && path != null && path.startsWith("/silbengenerator/")
            && !path.contains("..") && !path.contains("\\");
    }

    private WebResourceResponse assetResponse(Uri uri, String method) {
        if (!isLocal(uri) || !"GET".equals(method)) return errorResponse(403, "Forbidden");
        String path = uri.getPath().substring(1);
        if (path.endsWith("/")) path += "index.html";
        try {
            InputStream stream = getAssets().open(path);
            String mime = mimeType(path);
            Map<String, String> headers = new HashMap<>();
            headers.put("Cache-Control", "no-store");
            headers.put("X-Content-Type-Options", "nosniff");
            String encoding = mime.startsWith("image/") && !mime.endsWith("svg+xml") ? null : "UTF-8";
            return new WebResourceResponse(mime, encoding, 200, "OK", headers, stream);
        } catch (IOException missing) {
            return errorResponse(404, "Not Found");
        }
    }

    private static WebResourceResponse errorResponse(int status, String reason) {
        return new WebResourceResponse("text/plain", "UTF-8", status, reason,
            new HashMap<>(), new ByteArrayInputStream(new byte[0]));
    }

    private static String mimeType(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".webmanifest")) return "application/manifest+json";
        return "application/octet-stream";
    }

    private void setFullscreen(boolean full) {
        getWindow().getDecorView().setSystemUiVisibility(full
            ? View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            : View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        container.requestApplyInsets();
    }

    private void leaveFullscreen() {
        if (fullscreenView == null) return;
        container.removeView(fullscreenView);
        fullscreenView = null;
        webView.setVisibility(View.VISIBLE);
        setFullscreen(false);
        WebChromeClient.CustomViewCallback callback = fullscreenCallback;
        fullscreenCallback = null;
        if (callback != null) callback.onCustomViewHidden();
    }

    @Override
    public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused) setFullscreen(fullscreenView != null);
    }

    @Override
    public void onBackPressed() {
        if (fullscreenView != null) leaveFullscreen();
        else super.onBackPressed();
    }

    @Override
    protected void onPause() {
        webView.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onDestroy() {
        container.removeAllViews();
        webView.destroy();
        super.onDestroy();
    }
}
