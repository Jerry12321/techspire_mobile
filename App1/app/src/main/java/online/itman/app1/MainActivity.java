package online.itman.app1;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.AttributeSet;
import android.util.JsonReader;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.content.DialogInterface;
import android.widget.Button;
import android.widget.Toast;

import org.json.JSONObject;

import com.facebook.AccessToken;
import com.facebook.CallbackManager;
import com.facebook.FacebookException;
import com.facebook.FacebookCallback;
import com.facebook.FacebookSdk;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.login.LoginManager;
import com.facebook.login.LoginResult;
import com.facebook.login.widget.LoginButton;
import com.facebook.share.model.AppInviteContent;
import com.facebook.share.widget.AppInviteDialog;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.lang.reflect.Method;


public class MainActivity extends AppCompatActivity {

    CallbackManager callbackManager;
    AccessToken fb_token;
    WebView webView;
    GestureDetector gestureDetector;
    View.OnTouchListener gestureListener;
    protected MyGestureListener myGestureListener;
    private boolean mIsScrolling = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //FacebookSdk.sdkInitialize(this.getApplicationContext());
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        setContentView(R.layout.activity_main);

        //getSupportActionBar().setTitle("cool");


        //enable cookie
        CookieManager.setAcceptFileSchemeCookies (true);
        CookieManager.allowFileSchemeCookies();


        //Your Code Goes here ...
        webView = (WebView) findViewById(R.id.webview);
        webView.getSettings().setJavaScriptEnabled(true);

        myGestureListener = new MyGestureListener(this);
        webView.setOnTouchListener(myGestureListener);


        //webView.loadUrl("http://itman.online");
        //webView.loadUrl("http://google.com");
        //webView.loadUrl("http://itman.online/test2");
        //webView.loadUrl("http://itman.online/topcfd/mobile_app");
        //webView.loadUrl("file:///android_asset/mobile_app.html");

        //webView.loadUrl("http://guillaumebiton.github.io/HackerNews7");
        //webView.loadUrl("http://itman.online/topcfd/mobile_app1");
        webView.loadUrl("http://s33.test.techspire.com.au/mobile_app");

        WebSettings settings = webView.getSettings();
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

        //enable cookie
        String appCachePath = getApplicationContext().getCacheDir().getAbsolutePath();
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAppCachePath(appCachePath);
        CookieManager.getInstance().setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= 21) {
            // AppRTC requires third party cookies to work
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        //Facebook register



        callbackManager = CallbackManager.Factory.create();

        //LoginButton loginButton = (LoginButton) findViewById(R.id.fb_login_btn);
        LoginManager.getInstance().registerCallback(callbackManager, new FacebookCallback<LoginResult>() {
            @Override
            public void onSuccess(LoginResult loginResult) {
                // App code
                //alert('success');

                GraphRequest request = GraphRequest.newMeRequest(
                        loginResult.getAccessToken(),
                        new GraphRequest.GraphJSONObjectCallback() {
                            @Override
                            public void onCompleted(JSONObject object, GraphResponse response) {

                                // Application code
                                try {
                                    String id = object.getString("id");
                                    webView.loadUrl("javascript:fb_callback_handler('" + id + "')");
                                }catch(Exception e){

                                }
                            }
                        });
                Bundle parameters = new Bundle();
                parameters.putString("fields", "id,name,email,gender,birthday");
                request.setParameters(parameters);
                request.executeAsync();


               // getSupportActionBar().show();

            }
            @Override
            public void onCancel() {
                // App code
            }
            @Override
            public void onError(FacebookException exception) {
                // App code
            }
        });

        //enable javascript-to-android functio
        webView.addJavascriptInterface(new WebViewJavaScriptInterface(this), "_app");
    }

    @Override
    public boolean onTouchEvent(MotionEvent e) {

        // do your stuff here... the below call will make sure the touch also goes to the webview.

        gestureDetector.onTouchEvent(e);


        return super.onTouchEvent(e);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        callbackManager.onActivityResult(requestCode, resultCode, data);
    }

    public class WebViewJavaScriptInterface {

        private Context context;

        /*
         * Need a reference to the context in order to sent a post message
         */
        public WebViewJavaScriptInterface(Context context) {
            this.context = context;
        }

        /*
         * This method can be called from Android. @JavascriptInterface
         * required after SDK version 17.
         */
        @JavascriptInterface
        public void execute(String functionName, String data) {
            alert(functionName + "\r\n" + data);
            try {
                JSONObject data_object = (new JSONObject(data));
            } catch (Exception e) {
                //e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void alert(String data) {
            AlertDialog alertDialog = new AlertDialog.Builder(MainActivity.this).create();
            alertDialog.setTitle("Alert");
            alertDialog.setMessage(data);
            alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
                    new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    });
            alertDialog.show();
        }

        @JavascriptInterface
        public int write(String file_name, String data) {
            FileOutputStream outputStream;

            try {
                outputStream = openFileOutput(file_name, Context.MODE_PRIVATE);
                outputStream.write(data.getBytes());
                outputStream.close();
            } catch (Exception e) {
                e.printStackTrace();
                return 0;
            }

            return 1;
        }

        @JavascriptInterface
        public String read(String file_name) {
            try {
                FileInputStream fis = context.openFileInput(file_name);
                InputStreamReader isr = new InputStreamReader(fis);
                BufferedReader bufferedReader = new BufferedReader(isr);
                StringBuilder sb = new StringBuilder();
                String line;

                while ((line = bufferedReader.readLine()) != null) {
                    sb.append(line);
                }
                return sb.toString();
            } catch (Exception e) {
                return "";
            }
        }
        @JavascriptInterface
            public boolean check_connection() {
                ConnectivityManager connectivityManager
                        = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
                NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
                return activeNetworkInfo != null && activeNetworkInfo.isConnected();
            }
        @JavascriptInterface
        public void exit(){
            System.exit(0);
        }
        @JavascriptInterface
        public void fb_login(){
           runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Button v = (Button)findViewById(R.id.fb_login_btn);
                    if(v.getVisibility()==View.INVISIBLE) {
                        v.setVisibility(View.VISIBLE);
                    }
                }
            });
        }
        @JavascriptInterface
        public void fb_login_back(){
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Button v = (Button)findViewById(R.id.fb_login_btn);
                    if(v.getVisibility()==View.VISIBLE) {
                        v.setVisibility(View.INVISIBLE);
                    }
                }
            });
        }

        @JavascriptInterface
        public void toggle(Integer id_str){
            Button v = (Button)findViewById(id_str);
            if(v.getVisibility()==View.VISIBLE) {
                v.setVisibility(View.INVISIBLE);
            }else{
                v.setVisibility(View.VISIBLE);
            }
        }
        @JavascriptInterface
        public void test(){
            getSupportActionBar().show();
        }

        @JavascriptInterface
        public void check_fb_login(){
            //WebView webView = (WebView) findViewById(R.id.webview);
            //webView.loadUrl("javascript:alert_modal('good')");
            final AccessToken fb_token = AccessToken.getCurrentAccessToken();
            //getSupportActionBar().show();
           // webView.loadUrl("javascript:alert_modal('" + fb_token + "')");


            if (fb_token == null) {
                //Means user is not logged in
            }else{

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {//getSupportActionBar().show();
                        //WebView webView = (WebView) findViewById(R.id.webview);
                        //webView.loadUrl("javascript:alert_modal('" + fb_token + "')");
                        GraphRequest request = GraphRequest.newMeRequest(
                                fb_token,
                                new GraphRequest.GraphJSONObjectCallback() {
                                    @Override
                                    public void onCompleted(JSONObject object, GraphResponse response) {

                                        // Application code
                                        try {
                                            String id = object.getString("id");
                                            WebView webView = (WebView) findViewById(R.id.webview);
                                            webView.loadUrl("javascript:fb_callback_handler('" + id + "')");
                                        }catch(Exception e){

                                        }
                                    }
                                });
                        Bundle parameters = new Bundle();
                        parameters.putString("fields", "id,name,email,gender,birthday");
                        request.setParameters(parameters);
                        request.executeAsync();
                    }
                });
            }
        }

        @JavascriptInterface
        public void fb_logout(){
            LoginManager.getInstance().logOut();
        }

        @JavascriptInterface
        public void fb_invite(){
            String appLinkUrl, previewImageUrl;

            appLinkUrl = "http://www.itman.online/topcfd/fb_app_link";
            previewImageUrl = "https://www.mydomain.com/my_invite_image.jpg";

            if (AppInviteDialog.canShow()) {
                AppInviteContent content = new AppInviteContent.Builder()
                        .setApplinkUrl(appLinkUrl)
                        .setPreviewImageUrl(previewImageUrl)
                        .build();
                AppInviteDialog.show(MainActivity.this, content);
            }
        }
        @JavascriptInterface
        public void stop_scroll(){
            try
            {
                Field field = android.widget.AbsListView.class.getDeclaredField("mFlingRunnable");
                field.setAccessible(true);
                Object flingRunnable = field.get(webView);
                if (flingRunnable != null)
                {
                    Method method = Class.forName("android.widget.AbsListView$FlingRunnable").getDeclaredMethod("endFling");
                    method.setAccessible(true);
                    method.invoke(flingRunnable);
                }
            }
            catch (Exception e) {}
        }
    }

    class MyGestureListener extends GestureDetector.SimpleOnGestureListener implements View.OnTouchListener {
        Context context;
        GestureDetector gDetector;
        private static final int SWIPE_THRESHOLD = 100;
        private static final int SWIPE_VELOCITY_THRESHOLD = 100;

        public MyGestureListener()
        {
            super();
        }

        public MyGestureListener(Context context) {
            this(context, null);
        }

        public MyGestureListener(Context context, GestureDetector gDetector) {

            if(gDetector == null)
                gDetector = new GestureDetector(context, this);

            this.context = context;
            this.gDetector = gDetector;
        }


        @Override
        public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
            boolean result = false;
            try {
                float diffY = e2.getY() - e1.getY();
                float diffX = e2.getX() - e1.getX();
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD) {
                        if (diffX > 0) {
                            onSwipeRight();
                        } else {
                            onSwipeLeft();
                        }
                        result = true;
                    }
                }
                else if (Math.abs(diffY) > SWIPE_THRESHOLD && Math.abs(velocityY) > SWIPE_VELOCITY_THRESHOLD) {
                    if (diffY > 0) {
                        onSwipeBottom(diffY);
                    } else {
                        onSwipeTop();
                    }
                    result = true;
                }
            } catch (Exception exception) {
                exception.printStackTrace();
            }

            return super.onFling(e1, e2, velocityX, velocityY);
        }
        @Override
        public boolean onScroll(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
            boolean result = false;
            mIsScrolling = true;
            try {
                float diffY = e2.getY() - e1.getY();
                float diffX = e2.getX() - e1.getX();
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD) {
                        if (diffX > 0) {
                            onScrollRight();
                        } else {
                            onScrollLeft();
                        }
                        result = true;
                    }
                }
                else if (Math.abs(diffY) > SWIPE_THRESHOLD && Math.abs(velocityY) > SWIPE_VELOCITY_THRESHOLD) {
                    if (diffY > 0) {
                        onScrollBottom(diffY);
                    } else {
                        onScrollTop(diffY);
                    }
                    result = true;
                }
            } catch (Exception exception) {
                exception.printStackTrace();
            }

            return super.onScroll(e1, e2, velocityX, velocityY);
        }
        @Override
        public boolean onSingleTapConfirmed(MotionEvent e) {

            return super.onSingleTapConfirmed(e);
        }





        public boolean onTouch(View v, MotionEvent event) {

            // Within the MyGestureListener class you can now manage the event.getAction() codes.

            // Note that we are now calling the gesture Detectors onTouchEvent. And given we've set this class as the GestureDetectors listener
            // the onFling, onSingleTap etc methods will be executed.
            if(event.getAction() == MotionEvent.ACTION_UP) {
                if(mIsScrolling ) {
                    //Log.d("OnTouchListener --> onTouch ACTION_UP");
                    mIsScrolling  = false;
                    handleScrollFinished();
                };
            }

            return gDetector.onTouchEvent(event);
        }


        public GestureDetector getDetector()
        {
            return gDetector;
        }

        public void handleScrollFinished(){
            webView.loadUrl("javascript:onScrollFinished()");
        }
        public void onSwipeTop() {
            webView.loadUrl("javascript:onSwipe('top')");
            //Toast.makeText(MainActivity.this, "top", Toast.LENGTH_SHORT).show();
        }
        public void onSwipeRight() {
            webView.loadUrl("javascript:onSwipe('right')");
            // Toast.makeText(MainActivity.this, "right", Toast.LENGTH_SHORT).show();
        }
        public void onSwipeLeft() {
            webView.loadUrl("javascript:onSwipe('left')");
            //Toast.makeText(MainActivity.this, "left", Toast.LENGTH_SHORT).show();
        }
        public void onSwipeBottom(float diffY) {
            webView.loadUrl("javascript:onSwipe('bottom')");
            // Toast.makeText(MainActivity.this, "bottom", Toast.LENGTH_SHORT).show();
        }
        public void onScrollTop(float diffY) {
            webView.loadUrl("javascript:onScroll('top',"+(0-diffY)+")");
            //Toast.makeText(MainActivity.this, "top", Toast.LENGTH_SHORT).show();
        }
        public void onScrollRight() {
            webView.loadUrl("javascript:onScroll('right')");
            // Toast.makeText(MainActivity.this, "right", Toast.LENGTH_SHORT).show();
        }
        public void onScrollLeft() {
            webView.loadUrl("javascript:onScroll('left')");
            //Toast.makeText(MainActivity.this, "left", Toast.LENGTH_SHORT).show();
        }
        public void onScrollBottom(float diffY) {
            webView.loadUrl("javascript:onScroll('bottom',"+diffY+")");
            // Toast.makeText(MainActivity.this, "bottom", Toast.LENGTH_SHORT).show();
        }
    }

}
