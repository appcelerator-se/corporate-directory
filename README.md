[titanium-badge]:http://www-static.appcelerator.com/badges/titanium-git-badge-sq.png
[expanded-app]:https://github.com/appcelerator-se/corporate-directory/blob/master/screenshots/directory-expanded.png?raw=true
[app-navigation-gif]:https://github.com/appcelerator-se/corporate-directory/blob/master/screenshots/app-navigation-animated.gif?raw=true
[add-bookmark-gif]:https://github.com/appcelerator-se/corporate-directory/blob/master/screenshots/add-bookmark-animated.gif?raw=true
[bookmark-indicator]:https://github.com/appcelerator-se/corporate-directory/blob/master/screenshots/bookmark-indicator.png?raw=true

Corporate Directory App [![Appcelerator Titanium](http://www-static.appcelerator.com/badges/titanium-git-badge-sq.png)](http://appcelerator.com/titanium/)
=======================

![][expanded-app]


Everyone needs to have quick and easy access to their business contacts. This corporate directory application showcases how you can easily build a high quality, cross platform application using the Appcelerator Mobile Platform.

Key App Features 
----------------

#### master Branch
+ A master / detail application using a customized ListView
+ Searchable List
+ ListViewSections created based on last name initial
+ ListView Indexes (iOS only)
+ Native Navigation Patterns using NavigationWindow for iOS and standard Windows for Android
+ Includes native hooks to Maps, Email and Phone applications
+ Loading data from local Filesystem

#### data-binding Branch
+ Collection data binding to ListView
+ Model / View binding on the Profile Page
+ Uses Alloy Models to sync sample data to the SQLite database

_Note: The data-binding branch does not create ListViewSections in the directory view._

Quick Start
-----------
+ Open **Appcelerator Studio** and from the menu select _File -> Import..._
+ In the **Import** dialog that opens, make sure the you expand the _Git_ folder and select _Git Repository as New Project_
+ Click the **URI** radio button option and paste URL of this repository into the text field
+ Click _Finish_

_Note: By default this project will be downloaded and cloned into your existing workspace_

App Navigation
--------------
While the Directory app seems pretty full featured, its primarily a basic master / detail view application. 

![Directory App Navigation][app-navigation-gif]

+ MasterView => Directory Listing
    + View Contacts in Searchable List
    + Access Bookmarks
    + Quick Index Search - swipe left to reveal List Index (iOS Only)
    
+ DetailView => Profile View
    + View Contact information
    + Add/Remove Contact as Bookmark
    + One Click to Email
    + One Click to Call

There is also one other view, for viewing your bookmarked contacts, but as you can see in the code we are actually _re-using_ the same Directory Listing as the MasterView, and just filtering the contacts based on which ones are bookmarks. This is a great technique for when you need to show content, but simply need to filter by a particular property etc.




Bookmarks
---------
To quickly access people that you contact more frequently, this Directory application allows you to easily bookmark a contact for quick reference later. Bookmarked contacts are denoted by a light blue ribbon. 

![Bookmarked Contact][bookmark-indicator]

You can access your bookmarked contacts at anytime by clicking on the _book_ icon next to the search bar (on iOS) or in the action bar (on Android). 

Adding a bookmark is easy, as the image below demonstrates.

![Adding a Bookmark (animation)][add-bookmark-gif]

#### Adding a Bookmark
1. **Open** the _Directory_ app
2. **Click** on a contact that is not already bookmarked
3. On the _Profile_ view, **click** on the _Add to Bookmarks_ button
4. **Click** on the _Directory_ back button to see your new bookmarked contact
5. 

#### Removing a Bookmark
1. **Open** the _Directory_ app
2. **Click** on a contact that is bookmarked
3. On the _Profile_ view, **click** on the _Remove From Bookmarks_ button
4. **Click** on the _Directory_ back button to see your new bookmarked contact


> For a more detailed overview, check out the repo [wiki](https://github.com/appcelerator-se/corporate-directory/wiki)



Get Help
------------

There are a number of ways to get help with the Appcelerator Mobile Platform.

### Official Documentation, Tutorials and Videos

Please visit the official documentation site at [http://docs.appcelerator.com/](http://docs.appcelerator.com/) for the latest and historical documentation on Titanium, Alloy and the various products built by Appcelerator.

### Developer Community 

[Appcelerator Developer](http://developer.appcelerator.com) is our developer community.  

### Video Tutorials

[Appcelerator Videos](http://www.vimeo.com/appcelerator) is our main video channel
for video tutorials on Titanium.

### IRC 

Titanium developers regularly visit `#titanium_app` on irc.freenode.net.

### Twitter

Please consider following the [@Appcelerator Twitter](http://www.twitter.com/appcelerator)
team for updates.

### Blog

The Appcelerator corporate blog is called [Think Mobile](http://thinkmobile.appcelerator.com/blog).
The Appcelerator developer blog is located at (http://developer.appcelerator.com/blog).

### Commercial Support, Licensing

We give our software away for FREE!  In order to do that, we have programs for 
companies that require additional level of assistance through training or commercial support,
need special licensing or want additional levels of capabilities.  Please visit the
[Appcelerator Website](http://www.appcelerator.com) for more information about Appcelerator or
email [info@appcelerator.com](mailto:info@appcelerator.com).


Legal Stuff
-----------

Appcelerator is a registered trademark of Appcelerator, Inc. Titanium is 
a registered trademark of Appcelerator, Inc.  Please see the LEGAL information about using our trademarks,
privacy policy, terms of usage and other legal information at [http://www.appcelerator.com/legal](http://www.appcelerator.com/legal).
