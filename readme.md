
## Developing with Chrome:

Type this into the Terminal to disable caching in Google Chrome Canary and enable loading of files in the local system
    
    /Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --disable-application-cache --allow-file-access --disable-web-security
    
## Developing with FireFox

Enable JavaScript access to your local file system:

1) enter `about:config` into the url bar of the browser.
2) Enter `origin` in the search field named ** Filter**.
3) Change `security.fileuri.strict_origin_policy` to false

Install the [Web Developer](http://chrispederick.com/work/web-developer/) add-on and restart FireFox.

 Disable caching while developing:

1) Enable **Tools::Web Developer::Disable::Disable Cache**