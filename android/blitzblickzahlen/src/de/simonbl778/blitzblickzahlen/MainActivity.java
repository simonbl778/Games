package de.simonbl778.blitzblickzahlen;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Collections;

public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/blitzblickzahlen/index.html";
    private WebView game;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        game = new WebView(this);
        game.setBackgroundColor(0xfff7f5ee);
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBlockNetworkLoads(true);
        settings.setUserAgentString(settings.getUserAgentString() + " BlitzblickzahlenAndroid/1.1.0");
        game.setWebChromeClient(new WebChromeClient());
        game.setWebViewClient(new BundledFiles());
        game.addJavascriptInterface(new ShareBridge(), "BlitzblickAndroid");
        setContentView(game);
        immersive();
        game.loadUrl(START);
    }

    @SuppressWarnings("deprecation") private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused) immersive();
    }

    @Override protected void onPause() {
        if (game != null) {
            game.evaluateJavascript("window.dispatchEvent(new Event('blitzblickpause'))", null);
            game.onPause();
        }
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        if (game != null) game.onResume();
    }

    @SuppressWarnings("deprecation") @Override public void onBackPressed() {
        game.evaluateJavascript("(function(){var b=document.getElementById('end-game-button');if(b&&!b.hidden){b.click();return true;}return false;})()",
            handled -> { if (!"true".equals(handled)) finish(); });
    }

    @Override protected void onDestroy() {
        if (game != null) {
            game.removeJavascriptInterface("BlitzblickAndroid");
            game.destroy();
        }
        super.onDestroy();
    }

    public final class ShareBridge {
        @JavascriptInterface public void shareApk() {
            runOnUiThread(() -> {
                Uri apk = Uri.parse("content://de.simonbl778.blitzblickzahlen.apk/blitzblickzahlen.apk");
                Intent share = new Intent(Intent.ACTION_SEND);
                share.setType("application/vnd.android.package-archive");
                share.putExtra(Intent.EXTRA_STREAM, apk);
                share.setClipData(ClipData.newRawUri("Blitzblickzahlen.apk", apk));
                share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(Intent.createChooser(share, "Blitzblickzahlen teilen"));
            });
        }
    }

    private final class BundledFiles extends WebViewClient {
        @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if ("https".equals(uri.getScheme()) && HOST.equals(uri.getHost())) {
                if (uri.getPath().startsWith("/assets/blitzblickzahlen/")) return false;
                if ("/assets/".equals(uri.getPath())) view.loadUrl(START);
            }
            return true;
        }

        @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String path = uri.getPath();
            if (!"https".equals(uri.getScheme()) || !HOST.equals(uri.getHost())
                || path == null || !path.startsWith("/assets/blitzblickzahlen/")
                || path.contains("..") || path.contains("\\")) return missing();
            if (path.endsWith("/")) path += "index.html";
            String mime = path.endsWith(".js") ? "text/javascript"
                : path.endsWith(".css") ? "text/css" : path.endsWith(".png") ? "image/png"
                : path.endsWith(".svg") ? "image/svg+xml" : path.endsWith(".webmanifest") ? "application/manifest+json" : "text/html";
            try {
                return new WebResourceResponse(mime, mime.equals("image/png") ? null : "UTF-8", 200, "OK",
                    Collections.singletonMap("X-Content-Type-Options", "nosniff"),
                    getAssets().open("web/" + path.substring("/assets/".length())));
            } catch (IOException failure) { return missing(); }
        }

        private WebResourceResponse missing() {
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
        }
    }
}
