//
//  WebViewController.swift
//  SweatcoinPlatformExample
//
//  Created by Egor Khmelev on 03.08.2021.
//

import UIKit
import WebKit
import SafariServices

class WebViewController: UIViewController, WKUIDelegate, WKScriptMessageHandler, UIViewControllerTransitioningDelegate {
  static let MessageHandlerName = "MessageHandler"
  
  var webView: WKWebView!
  
  @available(iOS 12.0, *)
  lazy var appearance: UIUserInterfaceStyle? = {
    // NOTE: If your app is able to override system's interface style, you should adapt this code and traitCollectionDidChange to reflect that
    return UIScreen.main.traitCollection.userInterfaceStyle
  }()

  override func loadView() {
    let buildNumber: String = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as! String

    let userController = WKUserContentController()
    userController.add(self, name: WebViewController.MessageHandlerName)
    
    let webConfiguration = WKWebViewConfiguration()
    webConfiguration.applicationNameForUserAgent = "\(webConfiguration.applicationNameForUserAgent ?? "") AppName/\(buildNumber))"
    webConfiguration.userContentController = userController
    
    webView = WKWebView(frame: .zero, configuration: webConfiguration)
    webView.uiDelegate = self
    webView.backgroundColor = UIColor.white
    if #available(iOS 11.0, *) {
      webView.scrollView.contentInsetAdjustmentBehavior = .never
    }
    view = webView
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    loadWebView()
  }
  
  func loadWebView() {
    let myURL = URL(string:"https://platform.sweatco.in/webview/")

    var myRequest = URLRequest(url: myURL!)
    myRequest.addValue("{user's token here}", forHTTPHeaderField: "Authentication-Token")

    if #available(iOS 12.0, *) {
      myRequest.addValue(appearance == .dark ? "dark" : "light", forHTTPHeaderField: "Application-Appearance")
    }

    webView.load(myRequest)
  }
  
  // MARK: Appearance
  
  override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    if #available(iOS 12.0, *) {
      if appearance != UIScreen.main.traitCollection.userInterfaceStyle {
        appearance = UIScreen.main.traitCollection.userInterfaceStyle
        loadWebView()
      }
    }
  }
  
  // MARK: WKNavigationDelegate methods
  
  // Alert
  func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
    let alert = UIAlertController(title: "", message: message, preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "Ok", style: .default, handler: { _ in
      completionHandler()
    }))
    self.present(alert, animated: true, completion: nil)
  }
  
  // Confirm
  func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
    let alert = UIAlertController(title: "", message: message, preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "Ok", style: .default, handler: { _ in
      completionHandler(true)
    }))
    alert.addAction(UIAlertAction(title: "Cancel", style: .default, handler: { _ in
      completionHandler(false)
    }))
    self.present(alert, animated: true, completion: nil)
  }
  
  // MARK: WKScriptMessageHandler
  
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    if message.name == WebViewController.MessageHandlerName {
      if let body = message.body as? String, let json = try? JSONSerialization.jsonObject(with: body.data(using: .utf8)!, options: []) as? [String: Any] {
        
        let type = json["type"] as? String ?? ""
        switch type {
        case "SWC.COPY_CODE":
          if let payload = json["payload"] as? String {
            print("Copy", payload)
            let pasteBoard = UIPasteboard.general
            pasteBoard.string = payload
          }
        case "SWC.OPEN_URL":
          if let payload = json["payload"] as? String, let url = URL(string: payload) {
            print("Open Url", payload)
            let vc = SFSafariViewController(url: url)
            vc.transitioningDelegate = self
            present(vc, animated: true)
          }
        case "SWC.DISMISS":
          print("Dismiss")
        default:
          break
        }
      }
    }
  }
}
