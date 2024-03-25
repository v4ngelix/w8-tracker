# W8-Tracker

## Description:
A lightweight weight tracking application for personal use.

## Goals:
* Make tracking personal body weight and BMI over long period of more convenient.
  * Provide a simple interface for inputting weight - A simple website or a desktop application for daily measures.
  * Save the data in a database for the long-term storage - *Thus the weight data would be kept even if a journal or a piece of paper is lost.*
* Learn new technologies.
* Set up a RESTful application from scratch.
 
## TODO:
* FE
  * Replace chart.js with d3.js.
  * Adding value will make the chart to add the whole dataset again.
  * Have a nice looking and well animated chart.
  * Use separate urls for me and her weights?
  * Finish up the form.
  * Enable deleting of weight
  * Enable updating weights
  * Add a BMI chart.
  * Set up typescript compilation
  * Enable sorting table by date and weight (reuse getWEights function with sorting override?) 
  * have rendering method separate from the data fetching method.
  * Add "Estimated date for desired weight achieved" prediction.
    * Show weight trend (probably based on 7 day average).
    * Have favicon change color based on the weight. (chart rising / crhart falling).
  * Have index.html served as a default, find out a way how to use the existing back-end without port routing.
    * Might not be possible to use several ports on zone.ee server.

* BE:
  * Set up typescript compilation
  * Learn RESTful by building API endpoints with pure node.js.
  * Use proxying to avoid cors issues.
    * Get root path from .env file.
  * Retrieve data from a SQL database.
    * Save credentials in a .env file.

* DEVOPS:
  * Try Github webhooks. (POST query after events)
  * Set up a CI/CD pipeline with github actions. Would really need an automated way of updating the server.
  * Set up PM2 to keep node.js back-end running on the server.
  * NB! It seems that I'm unable to deploy node based applications on zone virtual server.
  * Find a way for continuous deployment with zone.ee server and github repository.
  * Product build should have a separate subrepo or if possible through Github actions, just upload the production build to the server.
