# W8-Tracker

## Description:
A lightweight weight tracking application for personal use. 

## Goals:
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
    * Replace chart.js with d3.js.
    * Have a nice looking and well animated chart.
    * Add a BMI line.
    * Highlight first days of the week?
    * Chart should show the whole dataset, or maybe 7 day averages from the beginning?
  * Add "Estimated date for desired weight achieved" prediction.
    * Show weight trend (probably based on 7 day average).
    * Have favicon change color based on the weight. (chart rising / crhart falling).
  * Adding value will make the chart to add the whole dataset again.
  * Use separate urls for me and her weights?
  * Finish up the form.
  * Enable updating weights.
  * Set up typescript compilation.
  * Enable sorting table by date and weight (reuse getWEights function with sorting override?) .
  * have rendering method separate from the data fetching method.
  * Show up to 7 last days weight as "open" or two weeks.
  * Other weights group based by week. Should be displayed in the table as collapsible rows.
  * or maybe have it toggleable, show all or the previous 365 days.
  * Somewhat same with the table. Table shouldn't be too long.
  * Where does the 7 day average calculation take place? Save it to DB? or calculate on the fly in BE or FE?
  * Have index.html served as a default, find out a way how to use the existing back-end without port routing.
    * Might not be possible to use several ports on zone.ee server.
  * Fix data updating.  
  * * https://date-fns.org/v3.6.0/docs/eachWeekOfInterval
  * Radio button for toggling differente types of chart modes.
  * Try out webcomponents.
  * Save view settings to localstorage

### Back-end:
  1. Set up typescript compilation.
  2. Use proxying to avoid cors issues.
  3. Try to have a static index.html file served as a default. And BE deal only with the API.
  4. Get root path from .env file.
  5. Enable modular code writing, separate code to different files.

### Devops:
  * Enable local server usage. Building and deploying to check changes is a very slow way of developing. 
  * Find a way for continuous deployment with zone.ee server and github repository:
    * Try Github webhooks. (POST query after events)
    * Set up a CI/CD pipeline with github actions. Would really need an automated way of updating the server.
    * Product build should have a separate subrepo or if possible through Github actions, just upload the production build to the server.

## Roadmap:
  1. Set up development server for faster development cycle.
  2. Rewrite everything is Typescript.
  3. Figure out how to compile and build everything for deployment.
  4. Switch charting libraries. 