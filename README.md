# W8-Tracker
*After the app is done, use this to write a summary to the portfolio page*

## Description:
Suckless weight tracking application for personal use. 

## Goals :
* Make tracking personal body weight and BMI over long period more convenient chore.
  * Provide a simple interface for inserting, updating and deleting weights.
  * Save the data in a database for the long-term storage.
* Learn new technologies:
  * Low-level full-stack application.
  * Set up a RESTful application from scratch.
  * Deal with all the nitty-gritty details of the application, without the help of any frameworks.
 
## Things to implement:
### Front-end
  * Chart:
    * Make imports from node_modules work, d3 intellisense doesn't work with cdn. 
    * Have a nice looking and well animated chart.
    * Add colored BMI line sectors.
    * Tooltip on hover
    * Chart should show the whole dataset, or maybe 7 day averages from the beginning?
  * Add "Estimated date for desired weight achieved" prediction.
    * Show weight trend (probably based on 7 day average).
  * Set up typescript compilation.
  * Table - Show up to 7 last days weight as "open" or two weeks.
    * Separate megatable page for the whole dataset?
    * or maybe have it toggleable, show all or the previous 365 days.
  * Other weights group based by week. Should be displayed in the table as collapsible rows.
    * Map data to weeks, collapsed data shows week diff and average.
    * If no data, then same as the previous.
  * Somewhat same with the table. Table shouldn't be too long.
  * Calculate and add to dataset, diff and 7-day average
  * Where does the 7 day average calculation take place? Save it to DB? or calculate on the fly in BE or FE?
  * Have index.html served as a default, find out a way how to use the existing back-end without port routing.
    * Might not be possible to use several ports on zone.ee server.
  * * https://date-fns.org/v3.6.0/docs/eachWeekOfInterval
  * Settings button for toggling differente types of chart modes.
    * Save changes to local storage
    * whether showing datapoints or averages
    * line
    * BMIs
    * Goal
  * Enable modules for better code readability (Typescript probably solves this)
  * Add authentication and user token savign to local storage, to make the project publicly demoable, while ensuring data integrity.

### Back-end:
  * Use proxying to avoid cors issues.
  * Try to have a static index.html file served as a default. And BE deal only with the API.
  * Enable modular code writing, separate code to different files.
  * Valdiate inputs from the backend  

### From notes (07.07.25)
diff sorting ajab keblast.
võimalus lisada periodiseeringuid?
a la 2024 Portugal.
a la 2025 Provance.
inputidel pole mingit valideerimist, tee mis tahad
andlesticks for averages.
[  ] Chart toggle, past 6/12 months or all time, with datapoints currently being monthly averages.
[  ] Chart data update.
[  ] Interpolated average line
[  ] Subrepo for sqlite

Browser vs code, self hosted?
W8 local storage secret, othetwise demo
Subrepo for buil, automstic version change vbaded on commit messsge ir patch, minor, msjor. Jenkins? Build ftom current mastet. Git flow?
[  ] 1yer 1mont 5yr etc view toggle
[  ] When roadmap is done, analysis like document to readme
[  ] A la clicks add, favicon changes, overwrites etc
[  ] Longrerm charts based on monthly averages. All data / njmber of datapoinr
[  ] On init load key from local storage
[  ] If no key, create temp in app memory?
[  ] Separate url for ligin. Dunno if w8 boh.ee/login local stor file cab be read from root
[  ] Shine effect every other minute?
[  ] Mony, 6monyh, yr, alll
w8 show and define periods.
* return to tartu
* return to tartu vol2
hydration' load stuff amd confs eyc vith workers
confeti when new low score
flames if new high score 

* Is it safe to listen to port:80?
* Would be good to have a static index.html served, even if the backend isn't working.
* Maybe if back is down or no secret is in local storage, works in demo mode and uses example data.

* Monorepo or separate BE from FE?
* Maybe only separate data from the main repo?
* Unify data column values
* Validation of inputs on the backend side.
vb hoopis nii, et weights on eraldi repo ja kui master push siis tehakse ajutises arvutis build ja buildi stuff kopeeritakse serverisse.
peaks muidugi katsetama, et kas oleks võimalik teise domeeni pealt backi serveerida, või siis sama domeeni alampathi pealt seda teha.