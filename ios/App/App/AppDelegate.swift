import UIKit
import Capacitor
import FirebaseCore

@objc(AppBridgeViewController)
class AppBridgeViewController: CAPBridgeViewController {

    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        return super.webView(with: frame, configuration: configuration)
    }

    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let config = super.webViewConfiguration(for: instanceConfiguration)
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        return config
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()

        if let pluginClass = NSClassFromString("FirebaseAuthenticationPlugin") as? CAPPlugin.Type {
            bridge?.registerPluginType(pluginClass)
            NSLog("[WynMotion iOS] Manually registered FirebaseAuthenticationPlugin via NSClassFromString")
        } else if let namespacedClass = NSClassFromString("CapacitorFirebaseAuthentication.FirebaseAuthenticationPlugin") as? CAPPlugin.Type {
            bridge?.registerPluginType(namespacedClass)
            NSLog("[WynMotion iOS] Manually registered namespaced FirebaseAuthenticationPlugin")
        } else {
            NSLog("[WynMotion iOS] ⚠️ FirebaseAuthenticationPlugin class not found at runtime")
        }
    }
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure Firebase FIRST — before any plugin touches it.
        FirebaseApp.configure()
        NSLog("[WynMotion iOS] Firebase configured successfully")
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
